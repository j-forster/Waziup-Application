# ![Hitchhiker Project](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/www/favicon.ico) Waziup.io Dashboard

This is a dashboard for the IoT and big data platfrom [Waziup.io](http://www.waziup.io/).
Graphical interfaces and easy-to-use components will help you create your own IoT structure.

[▶ The new dashboard is now hosted on GitHub.](https://j-forster.github.io/Waziup-Dashboard/www/index.html)

[![Waziup Dashboard](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/dashboard.png)](https://j-forster.github.io/Waziup-Dashboard/www/index.html)


## Entities
The dashboard can bring up the following attributes:

* ![Attribute Location](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/location.png) Location (geo:json)
* ![Attribute Polygon](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/polygon.png) Polygon
* ![Attribute Rectangle](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/rectangle.png) Rectangle
* ![Attribute Assert](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/notification.png) Notification
* Assert
* Subscription
* ![Attribute Collection](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/collection.png) Collection
* String
* Number
* JSON

... and these entity types:

* ![Entity SensingDevice](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/sensingdevice.png) SensingDevice
* ![Entity Person](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/person.png) Person
* ![Entity Fence](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/fence.png) Fence
* ![Entity Building](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/building.png) Building
* ![Entity Notification](https://raw.githubusercontent.com/j-forster/Waziup-Dashboard/master/asset/notification_entity.png) Notification

## Install

To test the dashboard locally, run the following commands:
```bash
$ npm install
$ npm start
```
You will need to have [Node.js](https://nodejs.org/en/) installed on your machine.<br>
This basically runs a simple http server, presenting the content of the `www` folder.

If you have your own http server already set up, you can link `www` without using Node.js.