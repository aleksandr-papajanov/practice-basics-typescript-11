import { ObservableCollection } from './observableCollection';
import { NotifyPropertyChanged } from './notifyPropertyChanged';
import { PostViewModel } from './postViewModel';
import { blogPosts } from './data';
import type { IPost } from './iPost';

export interface ISaveStorage {
  posts: IPost[];
  lastSaved: string;
  totalPosts: number;
}

export class PostCollectionViewModel extends NotifyPropertyChanged<PostCollectionViewModel> {
  private _posts: ObservableCollection<PostViewModel> = new ObservableCollection<PostViewModel>();
  private _selectedPost!: PostViewModel;

  public get selectedPost(): PostViewModel {
    return this._selectedPost;
  }

  public set selectedPost(value: PostViewModel) {
    const oldSelectedPost = this._selectedPost;

    if (this.raiseAndSetIfChanged(this._selectedPost, value, 'selectedPost', (v) => this._selectedPost = v)) {
      if (oldSelectedPost != undefined)
        oldSelectedPost.isSelected = false;

      this._selectedPost.isSelected = true;
    }
  }

  constructor() {
    super();

    this.selectNewPost();
  }

  public selectPost(post: PostViewModel): void {
    this.selectedPost = post;
  }

  public selectNewPost(): void {
    this.selectedPost = new PostViewModel({ title: '', body: '', author: '', modifiedAt: '' });
  }

  public removePost(post: PostViewModel): void {
    if (this._selectedPost === post) {
      this._selectedPost.isSelected = false;
      this._selectedPost.isManaged = false;
      this.selectNewPost();
    }

    this._posts.remove(post);
  }

  public saveSelectedPost(): void {
    this._selectedPost.modifiedAt = new Date().toISOString();
    
    this._selectedPost.saveToSource();

    if (!this._posts.has(this._selectedPost)) {
      this._posts.add(this._selectedPost);
    }
  }

  public movePostUp(post: PostViewModel): void {
    this._posts.move(post, this._posts.findIndex(post) - 1);
  }

  public movePostDown(post: PostViewModel): void {
    this._posts.move(post, this._posts.findIndex(post) + 1);
  }

  public addPost(post: PostViewModel): void {
    this._posts.add(post);
    post.isManaged = true;
  }

  public subscribeCollectionChanged(callback: (data: { action: string, item?: PostViewModel, oldIndex?: number, newIndex?: number, propertyName?: keyof PostViewModel }) => void): void {
    this._posts.subscribe('collectionChanged', callback);
  }

  public clearAllPosts(): void {
    this._posts.clear();
    this.selectNewPost();
  }

  public saveCollectionToStorage(): void {
    const postsData: IPost[] = this._posts.items.map(post => post.source);

    const dataToSave: ISaveStorage = {
      posts: postsData,
      lastSaved: new Date().toISOString(),
      totalPosts: postsData.length
    };

    // Otherwise doesn't work idk why
    setTimeout(() => {
      localStorage.setItem('hamster-blog-posts', JSON.stringify(dataToSave));
    }, 100);
  }

  public loadCollectionFromStorage(): void {
    this.clearAllPosts();

    const savedData = localStorage.getItem('hamster-blog-posts');

    if (!savedData)
      throw new Error('No saved data found, starting fresh');

    const jsonData: ISaveStorage = JSON.parse(savedData);

    jsonData.posts.reverse().forEach((postData: IPost) => {
      this.addPost(new PostViewModel(postData));
    });

    this.selectNewPost();
  }

  public enableAutoSave(): void {
    this._posts.subscribe('collectionChanged', (data) => {
      if (data.action === 'update') {
          const visualProperties = ['modifiedAt'];

        if (!visualProperties.includes(data.propertyName as string))
            return;
      }

      this.saveCollectionToStorage();
      console.log('Auto-saved');
    });

    console.log('Auto-save enabled');
  }

  public clearSavedData(): void {
    localStorage.removeItem('hamster-blog-posts');
    this.clearAllPosts();
  }
  
  public loadPredefinedPosts(): void {
    blogPosts.forEach(blogPost => {
        this.addPost(new PostViewModel(blogPost));
    });
  }
}
