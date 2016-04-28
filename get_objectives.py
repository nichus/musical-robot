#!/usr/bin/env python

import requests
import time

objectives = requests.get('https://api.guildwars2.com/v2/wvw/objectives')

for id in objectives.json():
  objective = requests.get('http://api.guildwars2.com/v2/wvw/objectives/%s' % id)
  print objective.text
  time.sleep(2)
