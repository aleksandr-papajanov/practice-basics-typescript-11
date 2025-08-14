import type { PostCollectionViewModel } from './postCollectionViewModel';
import { PostView } from './postView';
import type { PostViewModel } from './postViewModel';

export class PostCollectionView {
  private _context: PostCollectionViewModel;
  private _root: HTMLElement;
  private _views: PostView[] = [];

  // === Properties accessors ===
  public get root(): HTMLElement {
    return this._root;
  }

  constructor(context: PostCollectionViewModel) {
    this._context = context;

    this._context.subscribeCollectionChanged((data: any) => this.onCollectionChange(data.action, data.item!, data.oldIndex!, data.newIndex!, data.propertyName!));
    this._context.subscribePropertyChanged('selectedPost', (data: any) => this.onSelectedPostChanged(data.newValue));

    this._root = this.buildCollectionView();
  }

  // Method to handle collection changes
  private onCollectionChange(action: string, post: PostViewModel, oldIndex: number, newIndex: number, propertyName: keyof PostViewModel): void {
    const container = this._root.querySelector('.posts') as HTMLElement;

    switch (action) {
      case 'insert':
        const postView = new PostView(post, this._context);
        const postElement = postView.root;

        this._views.push(postView);

        if (newIndex < 0 || newIndex >= container.children.length) {
          container.appendChild(postElement);
        }
        else {
          const referenceElement = container.children[newIndex];
          container.insertBefore(postElement, referenceElement);
        }
        break;

      case 'remove':
        this.cleanupPostView(post);
        const elementToRemove = container.children[oldIndex];
        container.removeChild(elementToRemove);
        break;

      case 'move':
        const elementToMove = container.children[oldIndex];
        container.removeChild(elementToMove);
        
        if (newIndex >= container.children.length) {
          container.appendChild(elementToMove);
        }
        else {
          const referenceElement = container.children[newIndex];
          container.insertBefore(elementToMove, referenceElement);
        }
        break;

      case 'clear':
        this._views.forEach((view) => view.dispose());
        this._views = [];
        container.innerHTML = '';
        break;

      default:
        throw new Error(`Unknown collection action: ${action}`);
    }
  }

  private onSelectedPostChanged(post: PostViewModel): void {
      const form = this._root.querySelector('.create-post-form form') as HTMLFormElement;
      const titleInput = form.querySelector('#post-title') as HTMLInputElement;
      const authorInput = form.querySelector('#post-author') as HTMLInputElement;
      const bodyInput = form.querySelector('#post-body') as HTMLTextAreaElement;

      titleInput.value = post.title;
      authorInput.value = post.author;
      bodyInput.value = post.body;
  }

  private cleanupPostView(viewModel: PostViewModel): void {
    const view = this._views.find(view => view.context === viewModel);

    if (view) {
      view.dispose();

      const index = this._views.indexOf(view);
      if (index !== -1)
        this._views.splice(index, 1);
    }
  }

  private buildCollectionView(): HTMLElement {
    const root = document.createElement('div');

    root.className = 'posts-container';
    root.innerHTML = `
      <h1>Tech Blog Posts</h1>
      
      <div class="create-post-form">
        <h2>Create New Post</h2>

        <div class="errors"></div>

        <form>
          <div class="form-group">
            <label for="post-title">Title:</label>
            <input type="text" id="post-title" name="title" required />
          </div>

          <div class="form-group">
            <label for="post-author">Author:</label>
            <input type="text" id="post-author" name="author" required />
          </div>

          <div class="form-group">
            <label for="post-body">Body:</label>
            <textarea id="post-body" name="body" rows="8" required></textarea>
          </div>

          <div class="form-group actions">
            <button type="reset">Discard</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>

      <div class="posts"></div>
    `;

    const form = root.querySelector('.create-post-form form') as HTMLFormElement;
    
    const submitHandler = (event: Event) => {
      event.preventDefault();

      this._context.selectedPost.title = (root.querySelector('#post-title') as HTMLInputElement).value;
      this._context.selectedPost.author = (root.querySelector('#post-author') as HTMLInputElement).value;
      this._context.selectedPost.body = (root.querySelector('#post-body') as HTMLTextAreaElement).value;

      this._context.saveSelectedPost();
    };

    const resetHandler = (event: Event) => {
      event.preventDefault();
      this._context.selectNewPost();
    };

    form.addEventListener('submit', submitHandler);
    form.addEventListener('reset', resetHandler);

    return root;
  }
}
