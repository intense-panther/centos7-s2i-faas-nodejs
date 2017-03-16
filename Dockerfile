# intense-panther/centos7-s2i-faas-nodejs
FROM bucharestgold/centos7-s2i-nodejs:7.7.2

ENV BUILDER_VERSION 1.0

LABEL io.k8s.description="Platform for building and running Node.js functions" \
      io.k8s.display-name="Node.js $NODE_VERSION" \
      io.openshift.expose-services="8080:http" \
      io.openshift.tags="builder,nodejs,nodejs-$NODE_VERSION" \
      maintainer="Toby Crawley <toby@tcrawley.org>"

COPY ./s2i/ $STI_SCRIPTS_PATH

USER 0
RUN mkdir /opt/system/
COPY server.js /opt/system/server.js
USER 1001
