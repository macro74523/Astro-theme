import { type CollectionEntry, getCollection } from "astro:content";

export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

export function groupPostsByYear(posts: CollectionEntry<"post">[]) {
	return posts.reduce<Record<string, CollectionEntry<"post">[]>>((acc, post) => {
		const year = post.data.publishDate.getFullYear();
		if (!acc[year]) {
			acc[year] = [];
		}
		acc[year]?.push(post);
		return acc;
	}, {});
}

export function getAllTags(posts: CollectionEntry<"post">[]) {
	return posts.flatMap((post) => [...post.data.tags]);
}

export function getUniqueTags(posts: CollectionEntry<"post">[]) {
	return [...new Set(getAllTags(posts))];
}

export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}

export interface PostWithBilibiliCover {
	post: CollectionEntry<"post">;
	bilibiliCover?: string;
}

const BILIBILI_API = "https://api.bilibili.com/x/web-interface/view";

async function getBilibiliCoverFromBody(body: string): Promise<string | null> {
	const bvMatch = body.match(/BV[a-zA-Z0-9]{10}/);
	if (!bvMatch) return null;

	const bvid = bvMatch[0];
	try {
		const response = await fetch(`${BILIBILI_API}?bvid=${bvid}`);
		if (!response.ok) return null;

		const data = await response.json();
		if (data.code !== 0 || !data.data) return null;

		return data.data.pic as string;
	} catch {
		return null;
	}
}

export async function getAllPostsWithBilibiliCovers(): Promise<PostWithBilibiliCover[]> {
	const posts = await getAllPosts();
	const results: PostWithBilibiliCover[] = [];

	for (const post of posts) {
		if (!post.data.coverImage) {
			const cover = await getBilibiliCoverFromBody(post.body ?? "");
			results.push({ post, bilibiliCover: cover ?? undefined });
		} else {
			results.push({ post });
		}
	}

	return results;
}