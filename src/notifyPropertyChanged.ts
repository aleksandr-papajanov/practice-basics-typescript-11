type EventListener<T> = (data: T) => void;

export type NotifyPropertyChangedEvents<T = any> = {
  'propertyChanged': {
    propertyName: keyof T;
    oldValue: any;
    newValue: any;
  };
};

export abstract class NotifyPropertyChanged<T> {
  private listeners: Map<keyof NotifyPropertyChangedEvents<T>, EventListener<any>[]> = new Map();

  public subscribe<K extends keyof NotifyPropertyChangedEvents<T>>(event: K, listener: EventListener<NotifyPropertyChangedEvents<T>[K]>): void {
    if (!this.listeners.has(event))
      this.listeners.set(event, []);

    this.listeners.get(event)!.push(listener);
  }

  public unsubscribe<K extends keyof NotifyPropertyChangedEvents<T>>(event: K, listener: EventListener<NotifyPropertyChangedEvents<T>[K]>): void {
    const eventListeners = this.listeners.get(event);
    
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);

      if (index > -1)
        eventListeners.splice(index, 1);
    }
  }

  protected invoke<K extends keyof NotifyPropertyChangedEvents<T>>(event: K, data: NotifyPropertyChangedEvents<T>[K]): void {
    const eventListeners = this.listeners.get(event);

    if (eventListeners)
      eventListeners.forEach(listener => listener(data));
  }

  public subscribePropertyChanged(propertyName: keyof T, listener: EventListener<NotifyPropertyChangedEvents<T>['propertyChanged']>): void {
    this.subscribe('propertyChanged', (data) => {
      if (data.propertyName === propertyName) {
        listener(data);
      }
    });
  }

  public unsubscribePropertyChanged(propertyName: keyof T, listener: EventListener<NotifyPropertyChangedEvents<T>['propertyChanged']>): void {
    this.unsubscribe('propertyChanged', (data) => {
      if (data.propertyName === propertyName) {
        listener(data);
      }
    });
  }

  protected raisePropertyChanged(propertyName: keyof T, oldValue: any, newValue: any): void {
    if (oldValue !== newValue) {
      this.invoke('propertyChanged', {
        propertyName,
        oldValue,
        newValue
      });
    }
  }

  protected raiseAndSetIfChanged<K extends keyof T>(currentValue: T[K], newValue: T[K], propertyName: K, setter: (value: T[K]) => void): boolean {
    if (currentValue !== newValue) {
      setter(newValue);
      this.raisePropertyChanged(propertyName, currentValue, newValue);
      return true;
    }

    return false;
  }
}