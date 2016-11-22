(api) => {
    api.store.counter = api.store.counter || 0;
    api.store.counter++;
    console.log('api.store.counter', api.store.counter );
    api.send({counter: api.store.counter});

    api.save(); // always call api.save() if you have put/modified something in the api.store
}