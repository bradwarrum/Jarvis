<h1>Jarvis</h1>
<p>Jarvis is a Node.js application serving as a GroupMe bot.</p>
####Summarize a Wikipedia article####
    $ Jarvis, wiki (Page Title)
####Get current weather conditions####
    $ Jarvis, weather (Zip Code | City, State)
####Get 7-day weather forecast####
    $ Jarvis, forecast (Zip Code | City, State)
####Set a reminder####
    $ Jarvis, reminder (Month Day, Time) (Message)
<p><b>Note: </b>Month is the three-letter alphabetic code, time is in military time.  Jarvis can also execute commands embedded in a reminder message</p>
####Cancel a reminder####
    $ Jarvis, cancel (token)
####Repeat a message####
    $ Jarvis, say (Message)
<p><b>Note: </b>This can be used for chaining calls to Jarvis.</p>
####Display the help contents####
    $ Jarvis, help
