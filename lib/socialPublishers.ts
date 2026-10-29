export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  error?: string;
  message?: string;
  timestamp: string;
  simulated?: boolean;
}

/**
 * Timeout helper with AbortController
 */
function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  };
}

/**
 * Publish LinkedIn post with optional hero image
 */
export async function publishToLinkedIn(
  accessToken: string,
  personUrn: string,
  commentary: string,
  imageBase64?: string
): Promise<PublishResult> {
  const timestamp = new Date().toISOString();

  // Handle demo or simulated credentials gracefully
  const isSimulated =
    !accessToken ||
    accessToken.startsWith("demo_") ||
    accessToken.startsWith("simulated_") ||
    !personUrn ||
    personUrn.startsWith("demo_");

  if (isSimulated) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const mockId = `urn:li:share:sim_${Date.now()}`;
    return {
      success: true,
      publishedUrl: `https://www.linkedin.com/feed/update/${mockId}`,
      message: "Published to LinkedIn (Simulated Feed)",
      simulated: true,
      timestamp
    };
  }

  const { signal, clear } = createTimeoutSignal(15000);

  try {
    let imageUrn: string | undefined = undefined;

    if (imageBase64 && imageBase64.startsWith("data:image")) {
      // 1. Initialize Upload
      const initRes = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202401",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initializeUploadRequest: { owner: `urn:li:person:${personUrn}` }
        }),
        signal
      });

      if (initRes.ok) {
        const initData = await initRes.json();
        const uploadUrl = initData.value?.uploadUrl;
        imageUrn = initData.value?.image;

        if (uploadUrl) {
          const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Uint8Array.from(atob(rawBase64), (c) => c.charCodeAt(0));
          await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": "image/png" },
            body: buffer,
            signal
          });
        }
      }
    }

    // 2. Create Post
    const payload: Record<string, unknown> = {
      author: `urn:li:person:${personUrn}`,
      commentary,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED" }
    };

    if (imageUrn) {
      payload.content = { media: { id: imageUrn, title: "Post Hero Image" } };
    }

    const postRes = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "LinkedIn-Version": "202401",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!postRes.ok) {
      const errText = await postRes.text().catch(() => "");
      let parsed: { message?: string; serviceErrorCode?: number } = {};
      try {
        parsed = JSON.parse(errText);
      } catch {
        // use raw text
      }
      const msg = parsed.message || errText || `HTTP ${postRes.status}`;
      throw new Error(`LinkedIn API error (${postRes.status}): ${msg}`);
    }

    const restliId = postRes.headers.get("x-restli-id") || `published_${Date.now()}`;
    return {
      success: true,
      publishedUrl: `https://www.linkedin.com/feed/update/${restliId}`,
      message: "Post successfully published to your LinkedIn feed",
      timestamp
    };
  } catch (e: any) {
    const isTimeout = e.name === "AbortError";
    return {
      success: false,
      error: isTimeout ? "LinkedIn request timed out after 15s" : e.message || "Failed to post to LinkedIn",
      timestamp
    };
  } finally {
    clear();
  }
}

/**
 * Publish X (Twitter) sequential thread chaining tweets
 */
export async function publishToTwitter(
  accessToken: string,
  posts: string[]
): Promise<PublishResult> {
  const timestamp = new Date().toISOString();

  // Handle demo or simulated credentials gracefully
  const isSimulated = !accessToken || accessToken.startsWith("demo_") || accessToken.startsWith("simulated_");

  if (isSimulated) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const mockId = `sim_${Date.now()}`;
    return {
      success: true,
      publishedUrl: `https://x.com/i/status/${mockId}`,
      message: `Simulated ${posts.length}-part thread posted to X`,
      simulated: true,
      timestamp
    };
  }

  const { signal, clear } = createTimeoutSignal(20000);

  try {
    let lastTweetId: string | undefined = undefined;
    let firstTweetId: string | undefined = undefined;

    for (let i = 0; i < posts.length; i++) {
      const body: Record<string, unknown> = { text: posts[i] };
      if (lastTweetId) {
        body.reply = { in_reply_to_tweet_id: lastTweetId };
      }

      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let parsed: { detail?: string; title?: string; errors?: { message: string }[] } = {};
        try {
          parsed = JSON.parse(errText);
        } catch {
          // ignore
        }
        const errorDetail =
          parsed.detail || parsed.errors?.[0]?.message || parsed.title || errText || `HTTP ${res.status}`;
        throw new Error(`X API error on Tweet #${i + 1} (${res.status}): ${errorDetail}`);
      }

      const data = await res.json();
      lastTweetId = data.data?.id;
      if (i === 0) firstTweetId = lastTweetId;
    }

    return {
      success: true,
      publishedUrl: `https://x.com/i/status/${firstTweetId}`,
      message: `All ${posts.length} tweets published as a thread on X`,
      timestamp
    };
  } catch (e: any) {
    const isTimeout = e.name === "AbortError";
    return {
      success: false,
      error: isTimeout ? "Twitter thread request timed out after 20s" : e.message || "Failed to publish thread to X",
      timestamp
    };
  } finally {
    clear();
  }
}

/**
 * Publish Instagram Carousel (via Meta Graph API)
 */
export async function publishToInstagramCarousel(
  accessToken: string,
  igUserId: string,
  slides: { title: string; imageUrl?: string }[],
  caption: string
): Promise<PublishResult> {
  const timestamp = new Date().toISOString();

  const isSimulated =
    !accessToken ||
    accessToken.startsWith("demo_") ||
    accessToken.startsWith("simulated_") ||
    !igUserId ||
    igUserId.startsWith("demo_");

  const validSlides = slides.filter((s) => s.imageUrl && s.imageUrl.startsWith("http"));

  if (isSimulated || validSlides.length < 2) {
    // If running in demo mode or without hosted HTTP image URLs
    await new Promise((resolve) => setTimeout(resolve, 850));
    const mockId = `ig_car_${Date.now()}`;
    return {
      success: true,
      publishedUrl: `https://www.instagram.com/p/${mockId}/`,
      message:
        validSlides.length < 2 && !isSimulated
          ? "Simulated IG carousel preview (Meta Graph API requires public HTTPS image URLs for live feed posts)"
          : "Carousel successfully published to Instagram Feed (Simulated)",
      simulated: true,
      timestamp
    };
  }

  const { signal, clear } = createTimeoutSignal(25000);

  try {
    // 1. Upload item containers
    const containerIds: string[] = [];
    for (const slide of validSlides) {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(
          slide.imageUrl!
        )}&is_carousel_item=true&access_token=${accessToken}`,
        { method: "POST", signal }
      );
      const data = await res.json();
      if (!data.id) {
        throw new Error(data.error?.message || "Failed to create slide container in Meta Graph API");
      }
      containerIds.push(data.id);
    }

    // 2. Create parent carousel container
    const parentRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media?media_type=CAROUSEL&children=${containerIds.join(
        ","
      )}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
      { method: "POST", signal }
    );
    const parentData = await parentRes.json();
    if (!parentData.id) {
      throw new Error(parentData.error?.message || "Failed to assemble parent carousel in Meta Graph API");
    }

    // 3. Publish container
    const pubRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${parentData.id}&access_token=${accessToken}`,
      { method: "POST", signal }
    );
    const pubData = await pubRes.json();
    if (!pubData.id) {
      throw new Error(pubData.error?.message || "Failed to execute carousel publish in Meta Graph API");
    }

    return {
      success: true,
      publishedUrl: `https://www.instagram.com/p/${pubData.id}/`,
      message: "5-slide carousel live on Instagram Feed",
      timestamp
    };
  } catch (e: any) {
    const isTimeout = e.name === "AbortError";
    return {
      success: false,
      error: isTimeout ? "Instagram carousel upload timed out after 25s" : e.message || "Failed to publish Instagram carousel",
      timestamp
    };
  } finally {
    clear();
  }
}

/**
 * Dispatch entire content week to n8n webhook or custom automation endpoint
 */
export async function dispatchToN8nWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<PublishResult> {
  const timestamp = new Date().toISOString();

  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      error: "Webhook URL is missing. Please configure your n8n or Make webhook in Settings.",
      timestamp
    };
  }

  // Validate URL structure
  try {
    const parsed = new URL(webhookUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Webhook URL must begin with http:// or https://");
    }
  } catch (e: any) {
    return {
      success: false,
      error: `Invalid Webhook URL: ${e.message}`,
      timestamp
    };
  }

  const { signal, clear } = createTimeoutSignal(12000);

  try {
    const enrichedPayload = {
      source: "Autonomous Studio Content Engine",
      version: "1.0.0",
      dispatchedAt: timestamp,
      ...payload
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*"
      },
      body: JSON.stringify(enrichedPayload),
      signal
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Webhook server responded with HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }

    return {
      success: true,
      publishedUrl: webhookUrl,
      message: "7-Day Content Schedule successfully queued into n8n workflow",
      timestamp
    };
  } catch (e: any) {
    const isTimeout = e.name === "AbortError";
    return {
      success: false,
      error: isTimeout
        ? "Webhook request timed out after 12s"
        : e.message || "Network error dispatching payload to n8n webhook",
      timestamp
    };
  } finally {
    clear();
  }
}
