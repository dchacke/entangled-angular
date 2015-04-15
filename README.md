# entangled-angular
Client side counterpart of Ruby gem [Entangled](https://github.com/dchacke/entangled) in Angular.

(There is also [one for plain JavaScript](https://github.com/dchacke/entangled-js).)

## Installation
You can either download or reference the file `entangled.js` from this repository, or simply install it with Bower:

```shell
$ bower install entangled-angular
```

Then include it in your HTML.

Lastly, add the Entangled module as a dependency to your Angular app:

```javascript
angular.module('appName', ['entangled']);
```

## Usage
**[First, you need to set up your backend.](https://github.com/dchacke/entangled)**

Entangled is best used within Angular services. For example, consider a `Message` service for a chat app:

```javascript
app.factory('Message', function(Entangled) {
  return new Entangled('ws://localhost:3000/messages');
});
```

In the above example, first we inject Entangled into our service, then instantiate a new Entangled object and return it. The Entangled object takes one argument when instantiated: the URL of your resource's index action (in this case, `/messages`). Note that the socket URL looks just like a standard restful URL with http, except that the protocol part has been switched with `ws` to use the websocket protocol. Also note that you need to use `wss` instead if you want to use SSL.

The Entangled service comes with these functions:

- `new(params)`
- `create(params, callback)`
- `find(id, callback)`
- `all(callback)`

...and the following functions on returned objects:

- `$save(callback)`
- `$update(params, callback)`
- `$destroy(callback)`

They're just like class and instance methods in Active Record.

In your controller, you could then inject that `Message` service and use it like so:

```javascript
// To instantiate a blank message, e.g. for a form;
// You can optionally pass in an object to new() to
// set some default values
$scope.message = Message.new();

// To instantiate and save a message in one go
Message.create({ body: 'text' }, function(message) {
  $scope.$apply(function() {
    $scope.message = message;
  });
});

// To retrieve a specific message from the server
// with id 1 and subscribe to its channel
Message.find(1, function(message) {
  $scope.$apply(function() {
    $scope.message = message;
  });
});

// To retrieve all messages from the server and
// subscribe to the collection's channel
Message.all(function(messages) {
  $scope.$apply(function() {
    $scope.messages = messages;
  });
});

// To store a newly instantiated or update an existing message.
// If saved successfully, $scope.message is updated in place
// with the attributes id, created_at and updated_at
$scope.message.body = 'new body';
$scope.message.$save(function() {
  // Do stuff after save
});

// To update a newly instantiated or existing message in place.
// If updated successfully, $scope.message is updated in place
// with the attributes id, created_at and updated_at
$scope.message.$update({ body: 'new body' }, function() {
  // Do stuff after update
});

// To destroy a message
$scope.message.$destroy(function() {
  // Do stuff after destroy;
  // The message object is now frozen, so as to prevent
  // further modification
});
```

All functions above will interact with your server's controllers in real time. Your scope variables will always reflect your server's most current data.

### Validations
Objects from the Entangled service automatically receive ActiveRecord's error messages from your model when you `$save()`. An additional property called `errors` containing the error messages is available, formatted the same way you're used to from calling `.errors` on a model in Rails.

For example, consider the following scenario:

```ruby
# Message model (Rails)
validates :body, presence: true
```

```javascript
// Controller (Angular)
$scope.message.$save(function() {
  console.log($scope.message.errors);
  // => { body: ["can't be blank"] }
});
```

You could then display these error messages to your users.

To check if a resource is valid, you can use `$valid()` and `$invalid()`. Both functions return booleans. For example:

```javascript
$scope.message.$save(function() {
  // Check if record has no errors
  if ($scope.message.$valid()) { // similar to ActiveRecord's .valid?
    alert('Yay!');
  }

  // Check if record errors
  if ($scope.message.$invalid()) { // similar to ActiveRecord's .invalid?
    alert('Nay!');
  }
});
```

Note that `$valid()` and `$invalid()` should only be used after $saving a resource, i.e. in the callback of `$save`, since they don't actually invoke server side validations. They only check if a resource contains errors.

### Associations
Entangled currently supports one-to-many associations through has-many and belongs-to associations.

#### Has Many
Inform your Angular parent service about the association:

```javascript
app.factory('Parent', function(Entangled) {
  // Instantiate Entangled service
  var Parent = new Entangled('ws://localhost:3000/parents');

  // Set up association
  Parent.hasMany('children');

  return Parent;
});
```

This makes a `children()` function available on your parent records on which you can chain all other functions to fetch/manipulate data:

```javascript
Parent.find(1, function(parent) {
  parent.children().all(function(children) {
    // children here all belong to parent with id 1
  });

  parent.children().find(1, function(child) {
    // child has id 1 and belongs to parent with id 1
  });

  parent.children().create({ foo: 'bar' }, function(child) {
    // child has been persisted and associated with parent
  });

  // etc
});
```

This is the way to go if you want to fetch records that only belong to a certain record, or create records that should belong to a parent record. In short, it is ideal to scope records to parent records.

Naturally, all nested records are also synced in real time across all connected clients.

#### Belongs To
Inform your Angular parent service about the association:

```javascript
app.factory('Child', function(Entangled) {
  // Instantiate Entangled service
  var Child = new Entangled('ws://localhost:3000/parents/:parentId/children');

  // Set up association
  Child.belongsTo('parent');

  return Child;
});
```

Take note of the wildcard `:parentId` in the websocket URL. It has to be the foreign key as camel case. So long as your child instance has a foreign key, it will be able to fetch its parent.

The above makes a `parent()` method available on your child records:

```javascript
Child.find(1, function(child) {
  // Assuming the parentId on the child is set
  child.parent(function(parent) {
    // do stuff with parent
  });
});

// or
var child = Child.new({ parentId: 1 });
child.parent(function(parent) {
  // do stuff with parent
});
```

In all above examples, the terms `parent`, `parents`, `child`, and `children` are only placeholders for your real model names. They will be overridden by what you pass to the methods `hasMany` and `belongsTo`.

### Helper Methods
The following helper methods are available on Entangled objects just as with ActiveRecord.

#### $persisted()
Use `$persisted()` on an object to check if it was successfully stored in the database.

```javascript
$scope.message.$persisted();
// => true or false
```

#### $newRecord()
Use `$newRecord()` on an object to check if it is newly instantiated.

```javascript
$scope.message.$newRecord();
// => true or false
```

#### $destroyed()
Use `$destroyed()` on an object to check if it has been removed from the database.

```javascript
$scope.message.$destroyed();
// => true or false
```

## Contributing
This repo is only a mirror for bower. Contribution happens in the gem's [main repo](https://github.com/dchacke/entangled#contributing).
