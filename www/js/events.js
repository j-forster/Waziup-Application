class Events {

  constructor() {

    this.listeners = {};
  }

  emit(event /*, [data] */ ) {

    var args = Array.prototype.slice.call(arguments, 1);


    if (Array.isArray(this.listeners['*']))
      for (var listener of this.listeners['*'].slice()) {
        //try {
          listener.call(this, event, ...args);
        //} catch (error) {
        //  console.error(error);
        //}
      }
    
    if (Array.isArray(this.listeners[event]))
      for (var listener of this.listeners[event].slice()) {
        //try {
          listener.apply(this, args);
        //} catch (error) {
        //  console.error(error);
        //}
      }
  }

  on(event, cb) {

    if (!(event in this.listeners))
      this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  once(event, cb) {

    if (!(event in this.listeners))
      this.listeners[event] = [];
    var callback = (msg) => {

      this.off(event, callback);
      cb(msg);
    };
    this.listeners[event].push(callback);
  }

  off(event, cb) {

    this.listeners[event].splice(this.listeners[event].indexOf(cb), 1);
  }
}
