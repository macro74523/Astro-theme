const BILIBILI_API = "https://api.bilibili.com/x/web-interface/view";

export interface BilibiliCover {
	bvid: string;
	coverUrl: string;
	title: string;
}

export async function getBilibiliCoverFromBody(body: string): Promise<BilibiliCover | null> {
	const bvMatch = body.match(/BV[a-zA-Z0-9]{10}/);
	if (!bvMatch) return null;

	const bvid = bvMatch[0];
	try {
		const response = await fetch(`${BILIBILI_API}?bvid=${bvid}`);
		if (!response.ok) return null;

		const data = await response.json();
		if (data.code !== 0 || !data.data) return null;

		return {
			bvid,
			coverUrl: data.data.pic,
			title: data.data.title,
		};
	} catch {
		return null;
	}
}