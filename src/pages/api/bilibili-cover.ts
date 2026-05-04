import type { APIRoute } from "astro";

const BILIBILI_API = "https://api.bilibili.com/x/web-interface/view";

export const GET: APIRoute = async ({ url }) => {
	const bvid = url.searchParams.get("bvid");

	if (!bvid || !bvid.startsWith("BV")) {
		return new Response(JSON.stringify({ error: "Invalid bvid" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const response = await fetch(`${BILIBILI_API}?bvid=${bvid}`);
		const data = await response.json();

		if (data.code !== 0 || !data.data) {
			return new Response(JSON.stringify({ error: "Video not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(
			JSON.stringify({
				bvid,
				coverUrl: data.data.pic,
				title: data.data.title,
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "public, max-age=3600",
				},
			},
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: "Failed to fetch" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};