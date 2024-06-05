# whatsapp-shabbat

this code looks like shit, so feel free to pr me

how to use:

1. go to google firebase and get yourself firebaseConfig.
2. put it in the app.
3. the bot is running

my setup is ec2 in aws.
I didn't use Docker, so if you want your project to run on linux (at least ubuntu) you need to install all the packages in the Docker file.

You might need to run some of this commands:
sudo dnf deplist https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm \
  | grep provider \
  | sort --unique \
  | awk '{print $2}' \
  | xargs sudo dnf install --best --allowerasing --skip-broken --assumeyes --quiet >& /dev/null

npx --yes @puppeteer/browsers install chrome@stable \
  | awk '{print $2}' \
  | xargs -I {} sudo ln --symbolic {} /usr/local/bin/chrome

npx --yes @puppeteer/browsers install chromedriver@stable \
  | awk '{print $2}' \
  | xargs -I {} sudo ln --symbolic {} /usr/local/bin/chromedriver