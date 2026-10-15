FROM --platform=linux/amd64 postgres@sha256:d32327f755bcd7d850eddf4880835c93d2294a2de1989e7123f5866ff0072f96
USER root
COPY debs /closure/debs
COPY debs.sha256 core-binaries.sha256 /closure/
RUN export DEBIAN_FRONTEND=noninteractive && cd /closure && sha256sum -c debs.sha256 && sha256sum -c core-binaries.sha256 && dpkg --unpack /closure/debs/*.deb && dpkg --configure -a && sha256sum -c core-binaries.sha256
USER 999:999
ENTRYPOINT ["/bin/false"]
CMD []
