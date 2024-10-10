import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject, map } from "rxjs";
import { environment } from "../../environments/environment";
import { Post } from "./post.model";

const url = environment.apiURL + "/posts/";

@Injectable({ providedIn: "root" })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts() {
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(url)
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  getPost(id: string) {
    return this.http.get<{ id: string, title: string, content: string, imagePath: string, creator: string }>(url + id);
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();  /* after adding image, had to use FormData() since it accepts both text and files */
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image)
    return this.http
      .post<{ message: string, post }>(url, postData);
  }

  updatePost(postId: string, title: string, content: string, image: File | string) {
    let postData: FormData | Post
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title)
    }
    else {
      postData = {
        id: postId,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
        likes: null,
        likedByUser: null
      }

    }
    return this.http.put(url + postId, postData);
  }

  deletePost(postId: string) {
    return this.http.delete(url + postId)
  }

}
