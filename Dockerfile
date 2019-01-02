FROM alpine:3.7
RUN apk add --no-cache supervisor nodejs nodejs-npm bash
RUN mkdir -p /var/log/supervisor

COPY package*.json ./
RUN npm install

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY run.sh /usr/local/bin/
RUN /bin/chmod +x /usr/local/bin/run.sh

COPY . .

CMD ["/usr/bin/supervisord"]