export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  error?: string;
  timestamp: string;
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
        })
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
            body: buffer
          });
        }
      }
    }

    // 2. Create Post
    const payload: any = {
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
      body: JSON.stringify(payload)
    });

    if (!postRes.ok) {
      const err = await postRes.json().catch(() => ({}));
      throw new Error(err.message || `LinkedIn HTTP ${postRes.status}`);
    }

    const restliId = postRes.headers.get("x-restli-id") || "published";
    return {
      success: true,
      publishedUrl: `https://www.linkedin.com/feed/update/${restliId}`,
      timestamp
    };
  } catch (e: any) {
    return { success: false, error: e.message, timestamp };
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
  try {
    let lastTweetId: string | undefined = undefined;
    let firstTweetId: string | undefined = undefined;

    for (let i = 0; i < posts.length; i++) {
      const body: any = { text: posts[i] };
      if (lastTweetId) {
        body.reply = { in_reply_to_tweet_id: lastTweetId };
      }

      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Twitter HTTP ${res.status}`);
      }

      const data = await res.json();
      lastTweetId = data.data?.id;
      if (i === 0) firstTweetId = lastTweetId;
    }

    return {
      success: true,
      publishedUrl: `https://x.com/i/status/${firstTweetId}`,
      timestamp
    };
  } catch (e: any) {
    return { success: false, error: e.message, timestamp };
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
  try {
    const validSlides = slides.filter((s) => s.imageUrl && s.imageUrl.startsWith("http"));
    if (validSlides.length < 2) {
      return {
        success: false,
        error: "Instagram carousels require hosted image URLs (at least 2 images).",
        timestamp
      };
    }

    // 1. Upload item containers
    const containerIds: string[] = [];
    for (const slide of validSlides) {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(
          slide.imageUrl!
        )}&is_carousel_item=true&access_token=${accessToken}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.id) containerIds.push(data.id);
    }

    // 2. Create parent carousel container
    const parentRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media?media_type=CAROUSEL&children=${containerIds.join(
        ","
      )}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
      { method: "POST" }
    );
    const parentData = await parentRes.json();
    if (!parentData.id) throw new Error(parentData.error?.message || "Failed to create carousel container");

    // 3. Publish container
    const pubRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${parentData.id}&access_token=${accessToken}`,
      { method: "POST" }
    );
    const pubData = await pubRes.json();
    if (!pubData.id) throw new Error(pubData.error?.message || "Failed to publish carousel");

    return {
      success: true,
      publishedUrl: `https://www.instagram.com/p/${pubData.id}/`,
      timestamp
    };
  } catch (e: any) {
    return { success: false, error: e.message, timestamp };
  }
}

/**
 * Dispatch entire content week to n8n webhook or custom automation endpoint
 */
export async function dispatchToN8nWebhook(
  webhookUrl: string,
  payload: any
): Promise<PublishResult> {
  const timestamp = new Date().toISOString();
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Webhook returned status ${res.status}`);
    }

    return {
      success: true,
      publishedUrl: webhookUrl,
      timestamp
    };
  } catch (e: any) {
    return { success: false, error: e.message, timestamp };
  }
}
