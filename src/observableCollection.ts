import { NotifyPropertyChanged } from './notifyPropertyChanged';

type EventListener<T> = (data: T) => void;

export type ObservableCollectionEvents<T> = {
  'collectionChanged': {
    action: 'add' | 'remove' | 'move' | 'update' | 'clear';
    item?: T;
    oldIndex?: number;
    newIndex?: number;
    propertyName?: keyof T;
  };
}

export class ObservableCollection<T> {
  private _collection: T[] = [];
  private _listeners: Map<string, ((data: any) => void)[]> = new Map();
  private _propertyChangedListeners: Map<T, (data: any) => void> = new Map();

  public has(item: T): boolean {
    return this._collection.includes(item);
  }

  public add(item: T): void {
    this._collection.push(item);
    const index = this._collection.length - 1;

    if (item instanceof NotifyPropertyChanged) {
      const listener = (_: any) => {
        this.invoke('collectionChanged', {
          action: 'update',
          item: item,
          propertyName: _.propertyName,
          oldIndex: index
        });
      };

      item.subscribe('propertyChanged', listener);
      this._propertyChangedListeners.set(item, listener);
    }

    this.invoke('collectionChanged', {
      action: 'add',
      item: item,
      newIndex: index
    });
  }

  public remove(item: T): void {
    const index = this.findIndex(item);

    if (index < 0 || index >= this._collection.length)
      return;

    const removedItem = this._collection.splice(index, 1)[0];

    // Unsubscribe from its property changes
    if (removedItem instanceof NotifyPropertyChanged) {
      const listener = this._propertyChangedListeners.get(removedItem);

      if (listener) {
        removedItem.unsubscribe('propertyChanged', listener);
        this._propertyChangedListeners.delete(removedItem);
      }
    }

    this.invoke('collectionChanged', {
      action: 'remove',
      item: removedItem,
      oldIndex: index
    });
  }

  public up(item: T): void {
    const index = this.findIndex(item);
    const newIndex = index - 1;

    if (newIndex < 0)
      throw new Error(`Cannot move item up: it is already at the top`);

    [this._collection[index], this._collection[newIndex]] = [this._collection[newIndex], this._collection[index]];

    this.invoke('collectionChanged', {
      action: 'move',
      item: item,
      oldIndex: index,
      newIndex: newIndex,
    });
  }

  public down(item: T): void {
    const index = this.findIndex(item);
    const newIndex = index + 1;

    if (newIndex >= this._collection.length)
      throw new Error(`Cannot move item down: it is already at the bottom`);

    [this._collection[index], this._collection[newIndex]] = [this._collection[newIndex], this._collection[index]];

    this.invoke('collectionChanged', {
      action: 'move',
      item: item,
      oldIndex: index,
      newIndex: newIndex,
    });
  }

  public clear(): void {
    const oldItems = [...this._collection];
    this._collection = [];

    // Unsubscribe from property changes of all items
    oldItems.forEach(item => {
      if (item instanceof NotifyPropertyChanged) {
        const listener = this._propertyChangedListeners.get(item);

        if (listener) {
          item.unsubscribe('propertyChanged', listener);
          this._propertyChangedListeners.delete(item);
        }
      }
    });

    if (oldItems.length > 0) {
      this.invoke('collectionChanged', {
        action: 'clear',
      });
    }
  }

  private findIndex(item: T): number {
    let i = this._collection.findIndex(p => p === item);

    if (i === -1)
      throw new Error(`Item not found in collection: ${item}`);

    return i;
  }

  public subscribe<K extends keyof ObservableCollectionEvents<T>>(event: K, listener: EventListener<ObservableCollectionEvents<T>[K]>): void {
    if (!this._listeners.has(event))
      this._listeners.set(event, []);

    this._listeners.get(event)!.push(listener);
  }

  public unsubscribe<K extends keyof ObservableCollectionEvents<T>>(event: K, listener: EventListener<ObservableCollectionEvents<T>[K]>): void {
    const eventListeners = this._listeners.get(event);
    
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);

      if (index > -1)
        eventListeners.splice(index, 1);
    }
  }

  private invoke<K extends keyof ObservableCollectionEvents<T>>(event: K, data: ObservableCollectionEvents<T>[K]): void {
    const eventListeners = this._listeners.get(event);

    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}