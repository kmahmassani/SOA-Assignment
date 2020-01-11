<div style="text-align: justify">

## Part A

### 1)

![ArchitectureDiagram](SOAArchDiagram.png)
*for eligibility, the communication of all the services with the Identity microservice has been ommitted*

### 2)

#### A brief flow of the system

First a charging point owner, using the REST Api or portal, registers with the system and fills out their profile, via the identity and user services.  He then creates records for his charging points in the Charging Point Info service.  Upon saving, the Charging Point Info service fires off an event message to the event bus which includes PointID, Location and MAC Address.  These event messages are subscribed to by the Location, Reservation and Point Status services.  The Location service now knows there is a point at those certain coordinates, the reservation service knows a new point is available for use, and the point status service now expects a device with that MAC address to connect to it.

The charging point itself connects to the point status service and provides live updates to it's status (Available/In-use/Maintenance mode) and possibly some identifying info as to which car is currently charging (could be useful for payment info).

After drivers are authenticated, their cars/phones query the location service with either a GPS point and a radius, or a route which they will travel.  They will get back a set of point ids which they can then query the Charging Point service (CPS) using GraphQL to get the subset of points which are compatible with their car and their live status which was retrieved by the CPS from the point status service.  After identifying one and making sure their are no prior reservations, they can either drive straight to it, or choose to reserve it themselves.

Once drivers arrive to the charging point and plug-in, their car would contact the reservation service and provide an estimation of how long they would take to be ready to move on. The charging point itself changes its status to in-use and back to available when the car unplugs.

#### Justification


The system has been designed with a microservices approach with the aim of striking a balance between the size and number of services.  

This allows the following benefits:

* **Easier to build and maintain**

  The system becomes eaiser to build and maintain as it is split into smaller microservices.  Each microservice is an independant, so a services can be coded in a different language and use different databases without any affect on the other services.  The individual services can also be deployed, swapped out and/or managed independently of the other services, each one can be allocated resources suited to it's requirements.  If one service fails, it should not affect the rest of the system, and should be easily replaced/restarted.

* **Improved Productivity**

  This design approach allows the system to be broken up into more manageable subsystems, which can each be the responsibility of different teams, leading to expert teams in their respective areas.  Each team can work independently without relying on other teams to finish their work.  Each service can be tested and deployed independently, improving quality assurance and reducing time taken for something to reach production.

* **Flexibility and Scalability**

  Because each service can use it's own tech stack, it can choose the best one for it's specific needs, and due to the fact that each service is decoupled from the rest, new services can be added to the system or existing ones scaled with relative ease.  This also allows experimentation, as a microservice written in one language can easily be replaced by another rewritten in a different language as compared to rewriting a whole monolithic application.

There is a price to pay however, that must be managed:

* **Cost of entry**

  Because the microservices become a distributed system, the code inherit some complexities.  Remote calls are slower than in-process ones, and have to be managed using asynchronous for example.  Remote calls can also fail at anytime, so you have to design for failure.  Generally speaking, your developers have to have reached a certain level of skill and maturity before they should attempt to build a microservices system.

<figure class="image">
  <img src="premium.png" alt="include.description">
  <figcaption>The Microservices Premium <cite>- Martin Fowler</cite></figcaption>
</figure>

*  **Eventual Consistency**

   >"Microservices introduce eventual consistency issues because of their laudable insistence on decentralized data management. With a monolith, you can update a bunch of things together in a single transaction. Microservices require multiple resources to update, and distributed transactions are frowned on (for good reason). So now, developers need to be aware of consistency issues, and figure out how to detect when things are out of sync before doing anything the code will regret."
   >
   > <cite>-- Martin Fowler</cite>
</div>

### 3)

* **HTTP(s) + REST**

  The combination of HTTP and REST was chosen for the majority of communications because HTTP is the widely accepted and defacto standard of communication on the internet.  It's use along with the REST design pattern and JSON serialization, provides a method that is easy to implement, takes advantage of the standard HTTP verbs, widely known, scalable and also platform independent.  Several tools to generate human and machine readable documentation for REST APIs are available, such as OpenAPI.

* **gRPC**

   While REST is primarily based on HTTP/1, gRPC is a protocol built on top of HTTP/2.  gRPC was chosen for:

  * Charging Points to connect to their status service due to the fact that it is more efficient than normal HTTP and REST, in it's use of protobuf for serialization and contract based communication (which is less resource demanding and therefore can be used in low power IoT devices).  It also allows the charging points to take adavantage of HTTP/2 and stream their current status to the service on the same consistent connection, unlike REST which would require a new connection to be negotiated everytime an update is to be sent.
  
  * For the charging point info and reservation services to read data from the status service.  Because this is internal communication, we do not need to cater to such a wide consumer base as the other REST based services.  We can use gRPC and reap it's performance and efficiency rewards.

* **GraphQL**

   The option of GraphQL was provided on the Charging Point Info service for cars and mobile apps where network bandwidth and latency might be of concern.  It provides those clients with the ability to query data and retrieve only the data and fields that they require.

### 4)

Service&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description
:--- | ---
Identity Service | This service deals with authentication and authorization for the whole system.  It can deal with external services to handle MFA, and provides access tokens to required across the rest of the services.  This was implemented in its own service as it acts as a gate keeper for the rest of the system.
User Service | This service encapsulates all info regarding to users, whether they be charging point owners or drivers, and via a web portal, mobile app, or car/program connecting directly to the REST api.  It contains profile information about each user, such as name, address, contact info.  In some cases, such as cars it might include, more detail such as color/model/registration of the car, due to this non-uniformity in data, and the fact that the data is largely non-relational,  it's data is stored in a NoSQL Document DB, such as CosmosDB or MongoDB.
Charging Point Info Service | Contains info regarding each charging point, such as who owns it, compatible charging types and power ratings, along with cost of use and charging speed and location.  Provides a GraphQL option to allow cars and mobile app consumers to specify exactly what data they need.
Location Service | This service is purely dedicated to the relatively CPU intensive operation of querying GPS coordinates.  It handles finding nearby charging points relative to a single GPS point, and also along a route, provided by a set of points.  It's database is GIS specific such as Postgres with the PostGIS plugin, and only contains Charging Point IDs along with their locations.
Reservation Service | This service handles reservations and scheduled maintenance/downtimes, allowing drivers and cars to reserve points in advance, and also for currently charging cars to give estimates of when they will move on and vacate the charge point.
Point Status Service | This service allows the charging points themselves to connect to the system and provide a heart-beat/status via gRPC streaming.  It can also provide the real time actual status of the point, regardless of any scheduled reservations or downtimes.

### 5)

![Sequence](UML.png)


https://martinfowler.com/articles/microservice-trade-offs.html
https://skelia.com/articles/5-major-benefits-microservice-architecture/
https://nordicapis.com/when-to-use-what-rest-graphql-webhooks-grpc/