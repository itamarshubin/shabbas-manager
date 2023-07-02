FROM node:18

WORKDIR /app

COPY package.json package.json
COPY dist dist
RUN npm install
RUN apt-get update \
    && apt-get install -y \
    unzip \
    libnss3 \
    ca-certificates\
    fonts-liberation\
    libasound2\
    libatk-bridge2.0-0\
    libc6\
    libcairo2\
    libcups2\
    libdbus-1-3\
    libexpat1\
    libfontconfig1\
    libgbm1\
    libgcc1\
    libglib2.0-0\
    libgtk-3-0\
    libnspr4\
    libnss3\
    libpango-1.0-0\
    libpangocairo-1.0-0\
    libstdc++6\
    libx11-6\
    libx11-xcb1\
    libxcb1\
    libxcomposite1\
    libxcursor1\
    libxdamage1\
    libxext6\
    libxfixes3\
    libxi6\
    libxrandr2\
    libxrender1\
    libxss1\
    libxtst6\
    lsb-release\
    wget\
    xdg-utils\
    && rm -rf /var/lib/apt/lists/* \
    && echo "progress = dot:giga" | tee /etc/wgetrc \
    && mkdir -p /mnt /opt /data \
    && wget https://github.com/andmarios/duphard/releases/download/v1.0/duphard -O /bin/duphard \
    && chmod +x /bin/duphard

ENTRYPOINT ["node", "./dist/app.js"]