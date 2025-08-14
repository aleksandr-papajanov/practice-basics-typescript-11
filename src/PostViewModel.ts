import type { IPost } from './iPost';
import { NotifyPropertyChanged } from './notifyPropertyChanged';

interface IPostViewModel extends IPost {
  isManaged: boolean;
  isSelected: boolean;
}

export class PostViewModel extends NotifyPropertyChanged<IPostViewModel> implements IPostViewModel {
  private _source: IPost;

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
    this.raiseAndSetIfChanged(this._title, value, 'title', (v) => this._title = v);
  }

  public get body(): string {
    return this._body;
  }
  public set body(value: string) {
    this.raiseAndSetIfChanged(this._body, value, 'body', (v) => this._body = v);
  }

  public get author(): string {
    return this._author;
  }
  public set author(value: string) {
    this.raiseAndSetIfChanged(this._author, value, 'author', (v) => this._author = v);
  }

  public get modifiedAt(): string {
    return this._modifiedAt;
  }
  public set modifiedAt(value: string) {
    this.raiseAndSetIfChanged(this._modifiedAt, value, 'modifiedAt', (v) => this._modifiedAt = v);
  }

  public get isManaged(): boolean {
    return this._isManaged;
  }
  public set isManaged(value: boolean) {
    this.raiseAndSetIfChanged(this._isManaged, value, 'isManaged', (v) => this._isManaged = v);
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this.raiseAndSetIfChanged(this._isSelected, value, 'isSelected', (v) => this._isSelected = v);
  }

  constructor(post: IPost) {
    super();

    this._source = post;
    
    this._title = post.title;
    this._body = post.body;
    this._author = post.author;
    this._modifiedAt = post.modifiedAt;
  }

  public saveToSource(): void {
    this._source.title = this._title;
    this._source.body = this._body;
    this._source.author = this._author;
    this._source.modifiedAt = new Date().toISOString();
  }
}
