const GhostAdminAPI = require('@tryghost/admin-api');

async function dispatchRequests(req) {
    const messages = []

    if(req.body.ghostKey && req.body.ghostUrl)
        try{
            messages.push( writeToGhost(req.body) )
        } catch(error){
            messages.push(error)
        }

    if(req.body.hashnodeKey)
        try{
            messages.push( await writeToHashnode(req.body) )
        } catch(error){
            messages.push(error)
        }    
    
    if(req.body.mediumKey)
        try{
            messages.push( await writeToMedium(req.body) )
        } catch(error){
            messages.push(error)
        }
    
    if(req.body.devKey)
        try{
            messages.push( await writeToDev(req.body) )
        } catch(error){
            messages.push(error)
        }  

    if(messages.length <= 0) messages.push("Error. For some reason, your blog did not post to any of the selected platforms.")

    return messages
}


async function writeToGhost(query){
    const api = new GhostAdminAPI({
        url: query.ghostUrl,
        key: query.ghostKey,
        version: "v3"
    });

    //After the ghostresult returns, use that information
    //to do a api.posts.edit event.
    //Now you can edit the featured image,
    //and make the post public.

    let postResult
    try{
        postResult = await api.posts.add({
            title: query.blogTitle,
            // mobiledoc: JSON.stringify({
            //     "version":"0.3.1",
            //     "atoms":[],
            //     "cards":[
            //     ],
            //     "markups":[],
            //     "sections":[[10,0],[1,"p",[]]]
            // }),
            // markdown: query.blogText),
            mobiledoc: JSON.stringify({"version":"0.3.1","atoms":[],"cards":[["markdown",{"markdown":query.headerAndBlogText}]],"markups":[],"sections":[[10,0],[1,"p",[]]]}),
            status: "published",
            tags: query.blogTags
        })
    } catch(err){
        console.log(err)
        return err
    }

    console.log("Successfully posted", postResult)

    // let editResult
    // try{
    //     editResult = await api.posts.edit({
    //         id: postResult.id,
    //         title: "YO",
    //         visibility: "public",
    //         updated_at: postResult.updated_at || new Date().toISOString()
    //     })
    // } catch(err){
    //     console.log(err)
    //     return err
    // }



    // console.log("Successfully posted", JSON.stringify(ghostResult, null, 2))

    return postResult
}

async function writeToDev(query){
    // console.log("DEV API", process.env.DEV_API_KEY)
    const myRequest = new Request(`https://dev.to/api/articles`, {
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
                body_markdown: query.headerAndContent,
                tags: query.blogTags,
                series: "Onepush Series"
            }
        })
      })

      try{
          const result =  await fetch(myRequest)
          return result
      } catch(error){
          return error
      }
}

async function writeToMedium(query){

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
            query.medium_user_id = responseData.data.id
        } catch(error){
            return error
        }
    }


    const myRequest = new Request(`https://api.medium.com/v1/users/${query.medium_user_id}/posts`, {
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
            content: query.headerAndContent,
            // canonicalUrl: `http://shaquilhansford.medium.com/posts/${query.blogTitle.replace(/\s/g, '-')}`,
            tags: query.blogTags,
            publishStatus: "public"
        })
    })

    try{
        const postRequest = await fetch(myRequest)              
        return await postRequest.json()
    } catch(error){
        console.log("Medium is breaking")
        return error
    }      
}

async function writeToHashnode(query){
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

        return await result.json()
        
    } catch(error){
        return error
    }
}

module.exports = {
    dispatchRequests,
}