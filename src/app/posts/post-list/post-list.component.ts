import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import this

import { Post } from "../post.model";
import { PostService } from "../post.service";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  isUserAuthenticated = false;
  userId: string;
  isLoading = false;
  totalPosts: number;
  filteredTotalPosts: number;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [2, 5, 10];
  postFilter = 'all';
  filteredPosts: Post[] = [];
  displayedPosts: Post[];
  isSearching = false;
  searchQuery = '';
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public postsService: PostService, private authSer: AuthService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts();
    this.userId = this.authSer.getUserId();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
        this.applyFiltersAndPagination();
      });
    this.authStatusSub = this.authSer.authStatusListener.subscribe(val => {
      this.isUserAuthenticated = val;
      this.userId = this.authSer.getUserId();
      this.applyFiltersAndPagination();
    });
  }

  onSearchInput(value: string) {
    this.searchQuery = value.trim().toLowerCase();
    this.isSearching = this.searchQuery !== '';
    this.applyFiltersAndPagination();
  }

  highlightSearch(title: string): SafeHtml {
    if (!this.searchQuery) {
      return this.sanitizer.bypassSecurityTrustHtml(title);
    }
    const searchQueryEscaped = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(searchQueryEscaped, 'gi');
    const highlightedTitle = title.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedTitle);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe({
      next: () => this.postsService.getPosts(),
      error: () => this.isLoading = false
    });
  }

  handlePageEvent(pageData: PageEvent) {
    this.postsPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.applyFiltersAndPagination();
  }


  applyFiltersAndPagination() {
    let filteredPosts = this.postFilter === 'my'
      ? this.posts.filter(post => post.creator === this.userId)
      : this.posts;
    if (this.searchQuery) {
      filteredPosts = filteredPosts.filter(post => post.title.toLowerCase().includes(this.searchQuery));
    }

    this.filteredTotalPosts = filteredPosts.length;
    // Ensure currentPage is within the valid range
    const maxPage = Math.ceil(this.filteredTotalPosts / this.postsPerPage);
    if (this.currentPage > maxPage) {
      this.currentPage = 1;
    }
    // Explicitly set paginator's length and pageIndex
    if (this.paginator) {
      this.paginator.length = this.filteredTotalPosts;
      this.paginator.pageIndex = this.currentPage - 1;
    }
    if (this.isSearching) {
      this.filteredPosts = filteredPosts; // Show all results on current page if searching
    } else {
      this.filteredPosts = filteredPosts.slice(
        (this.currentPage - 1) * this.postsPerPage,
        this.currentPage * this.postsPerPage
      );
    }
  }

  onPostFilterChange() {
    this.currentPage = 1;
    this.applyFiltersAndPagination()
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
