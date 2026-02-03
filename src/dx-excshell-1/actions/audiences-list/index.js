const fetch = require("node-fetch");

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body,
  };
}

exports.main = async (params) => {
  try {
    const incoming = params.__ow_headers || {};

    const authorization = incoming.authorization;
    const imsOrg = incoming["x-gw-ims-org-id"];
    const sandbox = incoming["x-sandbox-name"];

    if (!authorization || !imsOrg || !sandbox) {
      return json(401, {
        error:
          "Missing required headers. Need authorization, x-gw-ims-org-id, x-sandbox-name.",
      });
    }

    const apiKey = params.AEP_API_KEY;
    if (!apiKey) {
      return json(500, { error: "Missing action input AEP_API_KEY." });
    }

    // Optional paging controls per docs (start/limit/sort/etc). :contentReference[oaicite:2]{index=2}
    const limit = Number(params.limit || 50);
    const start = Number(params.start || 0);

    const url =
      "https://platform.adobe.io/data/core/ups/audiences" +
      `?limit=${encodeURIComponent(limit)}` +
      `&start=${encodeURIComponent(start)}` +
      `&sort=${encodeURIComponent("updateTime:desc")}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authorization,
        "x-gw-ims-org-id": imsOrg,
        "x-api-key": apiKey,
        "x-sandbox-name": sandbox,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return json(res.status, {
        error: "Failed to list audiences",
        details: data,
      });
    }

    const children = Array.isArray(data.children) ? data.children : [];

    // Return a UI-friendly shape
    const audiences = children.map((a) => ({
      id: a.id,
      audienceId: a.audienceId,
      name: a.name,
      description: a.description,
      namespace: a.namespace,
      lifecycleState: a.lifecycleState,
      updateTime: a.updateTime,
      createTime: a.creationTime,
      schemaName: a.schema?.name,
    }));

    return json(200, {
      count: audiences.length,
      audiences,
      raw: {
        // Useful for debugging pagination later
        hasChildrenArray: Array.isArray(data.children),
      },
    });
  } catch (e) {
    return json(500, { error: "Unhandled error", message: e.message });
  }
};
