export interface Post {
    id: string,
    title: string,
    content: string,
    imagePath: string,
    creator: string,
    likes: number;
    likedByUser: boolean;
}