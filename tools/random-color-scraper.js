const url = 'https://mastodon.nl/api/v1/accounts/122112/statuses'
fetch(url)
  .then(res => {
    if (!res.ok) throw Error(`Failed to load request "`)
  })