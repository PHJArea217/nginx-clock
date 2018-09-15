# nginx-clock

Web clock for nginx, ideal for NTP servers.

This project was inspired by the [USNO Master Clock](https://www.usno.navy.mil/USNO/time/display-clocks/simpletime)
and a number of other web clocks, such as
* [time.gov (NIST web clock)](https://www.time.gov/)
* [PTB Web Clock](https://uhr.ptb.de/)
* [NICT/JST Clock](https://www1.nict.go.jp/JST/JST_E.html)
* [Paris Observatory/SYRTE Web Clock](https://syrte.obspm.fr/cgi-bin/heure_op_js)
* [NRC Web Clock](https://www.nrc-cnrc.gc.ca/eng/services/time/web_clock.html)

The clock displays time in local time, Coordinated Universal Time \(UTC) and
all half-hour time zone offsets from -12 to +14.
Support for ~~other time zones and~~ daylight saving time is planned.

A live version of this web clock is available at https://webclock.peterjin.org.
See [this document](online-demo.md) for more information.

# Todo list

- [x] Time zone selector
- [x] Leap second warnings \(via IERS bulletin parsing)
- [ ] Use multiple endpoint requests and average them out
- [ ] Daylight saving time/summer time in time zone selector

# License \(2-clause BSD)

Copyright 2018 Peter H. Jin
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
