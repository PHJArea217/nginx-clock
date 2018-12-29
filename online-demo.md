# FAQs about the Web Clock demo on https://webclock.peterjin.org/

## What platform does this web clock demo run on?

GitLab Pages for static content with ~~Google Cloud Functions~~ an actual
nginx webserver as the backend.

Originally, I was considering the use of nginx on a VPS such as DigitalOcean,
but it was a bit too expensive for such a simple app \(one HTTP request that
simply returns the time). We use the Always Free limits; I have not even used
even one cent of my free trial credit.

Previously, this project used Google Cloud Functions, but it appears that
there is a bit of loading time for the Node.js runtime that it uses, and since
now I have an actual VPS for other stuff, I can use it too for the web clock.

And even earlier, this project used Google App Engine. However, there was a
significant delay of ~5 seconds whenever the server-side API endpoint was
called, which is unacceptable for a project like this, where latency must be
kept to a minimum. In addition, there were a lot of unnecessary supplmentary
files in the Hello World example project.

## How accurate is the backend clock?

The Web Clock backend relies on Google's time servers \(as with all Google
Cloud Platform apps), which should be fairly close to official timekeepers such
as NIST and USNO.

One drawback of using Google's time servers is the problem of leap smearing.
The servers that run Google services use
[leap-smeared time](https://developers.google.com/time/smear), so this clock
may not be accurate within 12 hours of a leap second event. Even NIST
[discourages](https://www.nist.gov/pml/time-and-frequency-division/services/internet-time-service-its)
this behavior.

## Is the source code available for the backend?

~~Not at this time. As I'm currently new to Google App Engine, I'm exploiting
the Hello World example project and replacing the /demo endpoint with the JSON
response necessary for the web clock.~~

[Yes](cloud-function.js).

## Can I use the API endpoint for my own demo?

This web clock was designed for hosting on your own NTP server, not
on someone else's server. However, if I decide that I have not nearly reached
quota limits, I may allow access from other domains.

# FAQs about the web clock in general

## Why don't you use a JS library such as jQuery?

It was deemed a little bit excessive since this is only a simple project.
Plus, it places a dependency on the Internet.

## What's the purpose of the generate\_204 line?

This is a hidden feature of all Google servers. It returns an empty response,
and it is used in the web clock specifically to maintain a keepalive connection
to the backend server, reducing overall latency for the actual time request.
