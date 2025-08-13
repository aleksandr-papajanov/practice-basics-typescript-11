import { ObservableCollection } from './observableCollection.ts';
import { PostViewModel } from './PostViewModel';
import { NotifyPropertyChanged } from './notifyPropertyChanged.ts';

export class PostCollectionViewModel extends NotifyPropertyChanged<PostCollectionViewModel> {
  private _posts: ObservableCollection<PostViewModel> = new ObservableCollection<PostViewModel>();
  private _selectedPost!: PostViewModel;

  // === Properties accessors ===

  public get selectedPost(): PostViewModel {
    return this._selectedPost;
  }

  public set selectedPost(value: PostViewModel) {
    const oldSelectedPost = this._selectedPost;

    if (this.raiseAndSetProperty(oldSelectedPost, value, 'selectedPost', (v) => this._selectedPost = v))
    {
      if (oldSelectedPost)
        oldSelectedPost.isSelected = false;
      
      if (this._posts.has(this._selectedPost))
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

    if (!this._selectedPost.isManaged) {
      this._posts.add(this._selectedPost);
      this._selectedPost.isManaged = true;
    }
  }

  public movePostUp(post: PostViewModel): void {
    this._posts.up(post);
  }

  public movePostDown(post: PostViewModel): void {
    this._posts.down(post);
  }

  public addPost(post: PostViewModel): void {
    this._posts.add(post);
    post.isManaged = true;
  }

  public subscribeCollectionChanged(callback: (data: { action: string, item?: PostViewModel, oldIndex?: number, newIndex?: number, propertyName?: string }) => void): void {
    this._posts.subscribe('collectionChanged', callback);
  }
}
