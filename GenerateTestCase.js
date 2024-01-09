const {VertexAI} = require('@google-cloud/vertexai');
const axios = require('axios'); 

async function generateContent() {
    try {
        let id=process.argv[2];
        //Get the description of the Jira ticket 
        const response = await axios.get("https://veer1109.atlassian.net/rest/api/2/issue/"+id+"?fields=description",{
            headers: {
                "Authorization": `Basic {jira_token}`
            } 
        });
        let desc = response.data.fields.description;
        const vertex_ai = new VertexAI({project: 'sage-tribute-408104', location: 'us-central1'});
        const model = 'gemini-pro';
        
        
        // Instantiate the models
        const generativeModel = vertex_ai.preview.getGenerativeModel({
          model: model,
          generation_config: {
            "max_output_tokens": 7000,
            "temperature": 0.1,
            "top_p": 1
        },
        });
      const req = {
        contents: [{role: 'user', parts: [{text: 'Give me test secnarios from' + desc }]}],
      };
    
      const streamingResp = await generativeModel.generateContent(req);
     // console.log(streamingResp.response.candidates.map(item => item.content.parts[0].text));
      let body = streamingResp.response.candidates.map(item => item.content.parts[0].text);
      body = body.toString().replace(/[\[\]']+/g, '');
      console.log(body);
    
    const postres = await axios.post("https://veer1109.atlassian.net/rest/api/2/issue/"+id+"/comment", {
        body: body
    },{
        headers: {
           
                "Authorization": `Basic {jira_token}`
             
        }
    });
    }
    catch(error) {
        console.error("Error fetching data:", error);
    }
    // Initialize Vertex with your Cloud project and location
    
};

generateContent();