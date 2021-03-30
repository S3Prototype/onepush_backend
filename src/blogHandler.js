const GhostAdminAPI = require('@tryghost/admin-api');
const { response } = require('express');
const fetch = require('node-fetch')

async function dispatchRequests(req) {
    // const messages = {}
    // const errors = {}

    let messages = []

    if(req.body.activeBlogs.length <= 0){
        return [
            addErrorMessage(`Please select the blogs you want to post to in the Connections tab.`)
        ]
    }

    if(!req.body.blogText)
        return [
            addErrorMessage(`Failed to submit. The body of your blog post is empty.`)
        ]
    
    
    if(!req.body.blogTitle)
        return [
            addErrorMessage(`Failed to submit. The title of your blog post is empty.`)
        ]

    messages = await Promise.all(req.body.activeBlogs.map(async blog=>{ 
        try{
            return writeTo[blog](req.body)
        } catch(err){
            if(err instanceof Error) err = err.message

            return addErrorMessage(err)
        }
    }))
    .then(res=>res)
    .catch(err=>addErrorMessage(`Fatal error. ${err}`))
    
    if(messages.length <= 0)
        messages.push(addErrorMessage("Your post did not submit to any of the selected platforms. Did you enter your API keys properly?"))
    return messages
}

function addErrorMessage(data){
    return {
        message: 'Error',
        data
    }
}

function addSuccessMessage(data, url){
    const returnData = {
        message: 'Success',
        data
    }
    
    if(url) returnData.url = url

    return returnData
}

async function getFetchError(error){   
    if(error instanceof Error) return error.message
    
    error = await error.json()
    return error.error
}

const writeTo = {
    'ghost_blog': writeToGhost,
    'medium_blog': writeToMedium,
    'hashnode_blog': writeToHashnode,
    'dev_blog': writeToDev,
}

async function writeToGhost(query){

    if(!query.ghostUrl || !query.ghostKey)
        return addErrorMessage('Please provide both an api url, and an api key for your ghost account.')

    const api = new GhostAdminAPI({
        url: query.ghostUrl,
        key: query.ghostKey,
        version: "v3"
    });

    let postResult
    try{
        postResult = await api.posts.add({
            title: query.blogTitle,
            mobiledoc: JSON.stringify({"version":"0.3.1","atoms":[],"cards":[["markdown",{"markdown":query.headerAndBlogText}]],"markups":[],"sections":[[10,0],[1,"p",[]]]}),
            status: "published",
            tags: query.blogTags
        })
    } catch(err){
        const errData = getFetchError(error)
        return addErrorMessage(`Failed to post to Ghost. ${errData}`)
    }

    postResult = await postResult.json()
    const url = ''
    if(postResult.url) url = postResult.url

    return addSuccessMessage("Successfully posted to ghost!", url)
}

async function writeToDev(query){
    if(!query.devKey)
        return addErrorMessage('Please provide an api key for your DEV account.')
    // console.log("DEV API", process.env.DEV_API_KEY)

      try{
          const result = await fetch(`https://dev.to/api/articles`, {
              method: 'POST',
              headers: { 
                  'api-key': `${query.devKey}`,
                  'Content-Type': 'application/json'
              },
              // mode: 'cors',
              // cache: 'default',
              body: JSON.stringify({
                  article: {
                      title: query.blogTitle,
                      published: true,
                      body_markdown: query.headerAndBlogText,
                      tags: query.blogTags,
                      series: "Onepush Series"
                  }
              })
            })
        
        result = await result.json()

        const url = ''
        if(result) url = result.url;

        return addSuccessMessage('Successfully posted to DEV!', url)

      } catch(error){
        const errData = getFetchError(error)

        return addErrorMessage(`Failed to post to DEV. ${errData}.`)
      }
}

async function writeToMedium(query){

    if(!query.mediumKey)
        return addErrorMessage(`Please provide an API key for your Medium account.`)


    if(!query.medium_user_id){
        try{
            const userData = await fetch(`https://api.medium.com/v1/me`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    "Accept-Charset": "utf-8",
                    "Host": "api.medium.com",
                    'Authorization': `Bearer ${query.mediumKey}`
                }
            })

            const responseData = await userData.json()
                //If we didn't get the user's ID
            if(!response.data.id)
                return addErrorMessage(`Could not find your account in Medium's databases. Did you enter the correct API key?`)

            query.medium_user_id = responseData.data.id
        } catch(error){
            const errData = getFetchError(error)

            return addErrorMessage(`Failed to post to Medium. We couldn't find your account in their databases. ${errData}`)
        }
    }

    try{
        const postRequest = await fetch(`https://api.medium.com/v1/users/${query.medium_user_id}/posts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "Accept-Charset": "utf-8",
                "Host": "api.medium.com",
                'Authorization': `Bearer ${query.mediumKey}`
            },
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                title: query.blogTitle,
                contentFormat: "markdown",
                content: query.headerAndBlogText,
                // canonicalUrl: `http://shaquilhansford.medium.com/posts/${query.blogTitle.replace(/\s/g, '-')}`,
                tags: query.blogTags,
                publishStatus: "public"
            })
        })

        const url = await postRequest.json().url
        return addSuccessMessage('Successfully posted to Medium!',
            url)
    } catch(error){
        const errData = getFetchError(error)
        return addErrorMessage(`Failed to post to Medium. ${errData}`)
    }      
}

async function writeToHashnode(query){
    if(!query.hashnodeKey)
        return addErrorMessage('Please provide an api key for your hashnode account.')

    try{
        const result = await fetch('https://api.hashnode.com', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `${query.hashnodeKey}`
            },
            body: JSON.stringify({
                query: "mutation createStory($input: CreateStoryInput!){ createStory(input: $input){ code success message } }",
                variables: {
                    input: {
                        title: query.blogTitle,
                        contentMarkdown: query.blogText,
                        tags: query.blogTags.map(tag=>{
                            return {
                            _id: "56744723958ef13879b9549b",
                            slug: tag,
                            name: tag
                            }
                        }),
                        coverImageURL: query.headerUrl,
                    }
                }
            })
        })

            //Hashnode doesn't return a url with a successful post.
        return addSuccessMessage('Successfully posted to Hashnode')
        
    } catch(error){
        const errData = getFetchError(error)
        return addErrorMessage(`Failed to post to Hashnode. ${errData}`)
    }
}

module.exports = {
    dispatchRequests,
}