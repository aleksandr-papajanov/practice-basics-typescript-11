import type { PostCollectionViewModel } from "./postCollectionViewModel";
import type { PostViewModel } from "./postViewModel";

export class PostView {
    private _context: PostViewModel;
    private _collection: PostCollectionViewModel;
    private _root: HTMLElement;
    private _moveUpButton!: HTMLButtonElement;
    private _moveDownButton!: HTMLButtonElement;
    private _editButton!: HTMLButtonElement;
    private _deleteButton!: HTMLButtonElement;

    public get root(): HTMLElement {
        return this._root;
    }

    public get context(): PostViewModel {
        return this._context;
    }

    constructor(context: PostViewModel, collection: PostCollectionViewModel) {
        this._context = context;
        this._collection = collection;
        this._root = this.build();

        // Set initial state
        this.onSelectedPostChanged(this._context.isSelected);

        // Subscribe to property changes
        this._context.subscribePropertyChanged('isSelected', this.onSelectedPostChanged);
        this._context.subscribe('propertyChanged', this.onPropertyChanged);
    }

    private build(): HTMLElement {
        const article = document.createElement('article');

        const date = new Date(this._context.modifiedAt);
        let dateString = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        article.className = 'post';
        article.innerHTML = `
            <h2 class="title">${this._context.title}</h2>

            <div class="body">
            <p>${this._context.body}</p>
            </div>

            <div class="meta">
            <span class="author">By ${this._context.author}</span>
            <span class="date">${dateString}</span>
            </div>

            <div class="actions">
            <button class="move-up-button"><span class="material-symbols-outlined">keyboard_double_arrow_up</span></button>
            <button class="move-down-button"><span class="material-symbols-outlined">keyboard_double_arrow_down</span></button>
            <button class="edit-button"><span class="material-symbols-outlined">edit_note</span></button>
            <button class="delete-button"><span class="material-symbols-outlined">close</span></button>
            </div>
        `;

        this._moveUpButton = article.querySelector('.move-up-button') as HTMLButtonElement;
        this._moveDownButton = article.querySelector('.move-down-button') as HTMLButtonElement;
        this._deleteButton = article.querySelector('.delete-button') as HTMLButtonElement;
        this._editButton = article.querySelector('.edit-button') as HTMLButtonElement;

        // Add event listeners for buttons
        this._moveUpButton.addEventListener('click', this.upClickHandler);
        this._moveDownButton.addEventListener('click', this.downClickHandler);
        this._deleteButton.addEventListener('click', this.deleteClickHandler);
        this._editButton.addEventListener('click', this.editClickHandler);

        return article;
    }


    private upClickHandler = (_: Event) => {
        this._collection.movePostUp(this._context);
    }

    private downClickHandler = (_: Event) => {
        this._collection.movePostDown(this._context);
    }

    private deleteClickHandler = (_: Event) => {
        this._collection.removePost(this._context);
    }

    private editClickHandler = (_: Event) => {
        this._collection.selectPost(this._context);
    }

    private onSelectedPostChanged = (data: any) => {
        if (data.newValue) {
            this._root.classList.add('selected');
            this._editButton.disabled = true;
        }
        else {
            this._root.classList.remove('selected');
            this._editButton.disabled = false;
        }
    }

    private onPropertyChanged = (data: any) => {
        const visualProperties = ['title', 'body', 'author', 'modifiedAt'];

        if (!visualProperties.includes(data.propertyName as string))
            return;

        switch (data.propertyName) {
            case 'title':
                const titleElement = this._root.querySelector('.title');
                if (titleElement) titleElement.textContent = this._context.title;
                break;
            
            case 'body':
                const bodyElement = this._root.querySelector('.body p');
                if (bodyElement) bodyElement.textContent = this._context.body;
                break;
            
            case 'author':
                const authorElement = this._root.querySelector('.author');
                if (authorElement) authorElement.textContent = `By ${this._context.author}`;
                break;
            
            case 'modifiedAt':
                const dateElement = this._root.querySelector('.date');
                if (dateElement) {
                    const date = new Date(this._context.modifiedAt);
                    let dateString = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    dateElement.textContent = dateString;
                }
                break;
        }
    }

    public dispose(): void {
        this._context.unsubscribePropertyChanged('isSelected', this.onSelectedPostChanged);
        this._context.unsubscribe('propertyChanged', this.onPropertyChanged);

        this._moveUpButton.removeEventListener('click', this.upClickHandler);
        this._moveDownButton.removeEventListener('click', this.downClickHandler);
        this._deleteButton.removeEventListener('click', this.deleteClickHandler);
        this._editButton.removeEventListener('click', this.editClickHandler);
    }
}