<h1>Jarvis</h1>
<p>Jarvis is a Node.js application serving as a GroupMe bot.</p>
<hr/>
####Usage####
#####Summarize a Wikipedia article#####
    $ Jarvis, wiki (TITLE)
#####Get current weather conditions#####
    $ Jarvis, weather (ZIP | CITY, ST)
#####Get 7-day weather forecast#####
    $ Jarvis, forecast (ZIP | CITY, ST)
#####Set a reminder#####
    $ Jarvis, reminder (MONTH DAY, TIME) (MESSAGE)
<p><b>Note: </b>MONTH is the three-letter alphabetic code, TIME is in military time.  Jarvis can also execute commands embedded in a reminder message</p>
#####Set a recurrence event#####
	$ Jarvis, recurrence ("daily" | ("weekly" | "monthly" DAY)) (TIME) (MESSAGE)
<p><b>Note: </b>When using weekly recurrences, DAY is the day of the week. When using monthly recurrences, DAY is the day of the month.  TIME is military time.  Jarvis can also execute commands embedded in a recurrence message</p>
#####Cancel a reminder#####
    $ Jarvis, cancel (TOKEN)
#####Repeat a message#####
    $ Jarvis, say (MESSAGE)
<p><b>Note: </b>Jarvis can also execute commands embedded in the message content</p>
#####Display the help contents#####
    $ Jarvis, help
#####Display the version and changelog info#####
	$ Jarvis, version
