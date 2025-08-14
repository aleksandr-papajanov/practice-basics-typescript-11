import { ObservableCollection } from './observableCollection';
import { NotifyPropertyChanged } from './notifyPropertyChanged';
import { PostViewModel } from './postViewModel';

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
    this._selectedPost.modifiedAt = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
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
}
