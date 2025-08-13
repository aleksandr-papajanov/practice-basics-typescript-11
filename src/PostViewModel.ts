import type { IPost } from './IPost';
import { NotifyPropertyChanged } from './notifyPropertyChanged.ts';

interface IPostViewModel extends IPost {
  isManaged: boolean;
  isSelected: boolean;
}

export class PostViewModel extends NotifyPropertyChanged<IPostViewModel> implements IPostViewModel {
  private _post: IPost;

  private _title: string;
  private _body: string;
  private _author: string;
  private _modifiedAt: string;

  private _isManaged: boolean = false;
  private _isSelected: boolean = false;

  public get title(): string {
    return this._title;
  }
  public set title(value: string) {
    this.raiseAndSetProperty(this._title, value, 'title', (v) => this._title = v);
  }

  public get body(): string {
    return this._body;
  }
  public set body(value: string) {
    this.raiseAndSetProperty(this._body, value, 'body', (v) => this._body = v);
  }

  public get author(): string {
    return this._author;
  }
  public set author(value: string) {
    this.raiseAndSetProperty(this._author, value, 'author', (v) => this._author = v);
  }

  public get modifiedAt(): string {
    return this._modifiedAt;
  }
  public set modifiedAt(value: string) {
    this.raiseAndSetProperty(this._modifiedAt, value, 'modifiedAt', (v) => this._modifiedAt = v);
  }

  public get isManaged(): boolean {
    return this._isManaged;
  }
  public set isManaged(value: boolean) {
    this.raiseAndSetProperty(this._isManaged, value, 'isManaged', (v) => this._isManaged = v);
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this.raiseAndSetProperty(this._isSelected, value, 'isSelected', (v) => this._isSelected = v);
  }

  constructor(post: IPost) {
    super();

    this._post = post;
    this._title = post.title;
    this._body = post.body;
    this._author = post.author;
    this._modifiedAt = post.modifiedAt;
  }

  public saveToSource(): void {
    this._post.title = this._title;
    this._post.body = this._body;
    this._post.author = this._author;
    this._post.modifiedAt = new Date().toISOString();
  }
}
