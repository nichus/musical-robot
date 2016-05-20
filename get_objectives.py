#!/usr/bin/env python

import requests
import time
import json

#objectives = requests.get('https://api.guildwars2.com/v2/wvw/objectives')
#
#for id in objectives.json():
#  objective = requests.get('http://api.guildwars2.com/v2/wvw/objectives/%s' % id)
#  print objective.text
#  time.sleep(2)

objective_ids = requests.get('https://api.guildwars2.com/v2/wvw/objectives').json()

objective_list = requests.get('https://api.guildwars2.com/v2/wvw/objectives',data = { 'ids': ','.join(objective_ids)}).json()

#print json.dumps(objective_list, indent=4, separators=(',', ': '))
print json.dumps(objective_list)
