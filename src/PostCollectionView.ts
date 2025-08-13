import type { PostCollectionViewModel } from './PostCollectionViewModel';
import type { PostViewModel } from './PostViewModel';

export class PostCollectionView {
  private _context: PostCollectionViewModel;
  private _root: HTMLElement;

  // === Properties accessors ===
  public get root(): HTMLElement {
    return this._root;
  }

  constructor(context: PostCollectionViewModel) {
    this._context = context;

    this._context.subscribeCollectionChanged(data => this.onCollectionChange(data.action, data.item!, data.oldIndex!, data.newIndex!, data.propertyName!));
    this._context.subscribePropertyChanged('selectedPost', data => this.onSelectedPostChanged(data.newValue));

    this._root = this.buildCollectionView();
  }

  // Method to handle collection changes
  private onCollectionChange(action: string, post: PostViewModel, oldIndex: number, newIndex: number, propertyName: keyof PostViewModel): void {
    const postsContainer = this._root.querySelector('.posts') as HTMLElement;

    switch (action) {
      case 'add':
        const postElement = this.buildPostView(post);
        postsContainer.appendChild(postElement);
        break;

      case 'remove':
        postsContainer.removeChild(postsContainer.children[oldIndex]);
        break;

      case 'move':
        const toMove = postsContainer.children[oldIndex] as HTMLElement;
        postsContainer.removeChild(toMove);
        postsContainer.insertBefore(toMove, postsContainer.children[newIndex]);
        break;

      case 'update':
        if (propertyName !== 'title' && propertyName !== 'body' && propertyName !== 'author')
          return;

        const updatedPostElement = this.buildPostView(post);
        postsContainer.replaceChild(updatedPostElement, postsContainer.children[oldIndex]);
        break;

      case 'clear':
        postsContainer.innerHTML = '';
        break;

      default: throw new Error(`Unknown action: ${action}`);
    }
  }

  private onSelectedPostChanged(post: PostViewModel): void {
      console.log(`View.onSelectedPostChanged: ${post.title}`);

      const form = this._root.querySelector('.create-post-form form') as HTMLFormElement;
      const titleInput = form.querySelector('#post-title') as HTMLInputElement;
      const authorInput = form.querySelector('#post-author') as HTMLInputElement;
      const bodyInput = form.querySelector('#post-body') as HTMLTextAreaElement;

      titleInput.value = post.title;
      authorInput.value = post.author;
      bodyInput.value = post.body;
  }

  // Method to create po
  private buildPostView(post: PostViewModel): HTMLElement {
    const article = document.createElement('article');

    article.className = 'post';
    article.innerHTML = `
      <h2 class="title">${post.title}</h2>

      <div class="body">
        <p>${post.body}</p>
      </div>

      <div class="meta">
        <span class="author">By ${post.author}</span>
        <span class="date">${post.modifiedAt}</span>
      </div>

      <div class="actions">
        <button class="move-up-button"><span class="material-symbols-outlined">keyboard_double_arrow_up</span></button>
        <button class="move-down-button"><span class="material-symbols-outlined">keyboard_double_arrow_down</span></button>
        <button class="edit-button"><span class="material-symbols-outlined">edit_note</span></button>
        <button class="delete-button"><span class="material-symbols-outlined">close</span></button>
      </div>
    `;

    post.subscribePropertyChanged('isSelected', (data) => {
        console.log(`View.onIsSelectedChanged: ${data.newValue}`);

        if (data.newValue) {
          article.classList.add('selected');
        } else {
          article.classList.remove('selected');
        }
    });

    // Add event listeners for buttons
    article.querySelector('.move-up-button')?.addEventListener('click', (_) => this._context.movePostUp(post));
    article.querySelector('.move-down-button')?.addEventListener('click', (_) => this._context.movePostDown(post));
    article.querySelector('.delete-button')?.addEventListener('click', (_) => this._context.removePost(post));
    article.querySelector('.edit-button')?.addEventListener('click', (_) => this._context.selectPost(post));

    return article;
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

    root.querySelector('.create-post-form form') as HTMLFormElement;
    root.addEventListener('submit', (event) => {
      event.preventDefault();

      this._context.selectedPost.title = (root.querySelector('#post-title') as HTMLInputElement).value;
      this._context.selectedPost.author = (root.querySelector('#post-author') as HTMLInputElement).value;
      this._context.selectedPost.body = (root.querySelector('#post-body') as HTMLTextAreaElement).value;

      this._context.saveSelectedPost();
    });
    root.addEventListener('reset', (event) => {
      event.preventDefault();
      this._context.selectNewPost();
    });

    return root;
  }
}
