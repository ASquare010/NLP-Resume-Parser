
//intlize and bind events 
{
    //Global Varibeles
    basePath = "D:/Git/NLP-Resume-Parser"
    // base_url = "ADD local host url like 192.168----!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    base_url = "http://192.168.100.102:8080"
    
    
    cv_base_path = basePath+"/models/Examples/CVs/"
    jd_base_path = basePath+"/models/Examples/JDs/"
    var cvQueue = [];
    var parsedCvQueue = [];



    //Events Bindings
    document.getElementById('jdFile').addEventListener('change', function () {
        var fileName = this.files[0].name;
        document.getElementById('jdFileName').textContent =  fileName;
    });

    document.getElementById('cvFiles').addEventListener('change', function () {

        cvQueue = [];
        parsedCvQueue =[];
        var fileList =  this.files;
        var cvList = document.getElementById('cvList');

        cvList.innerHTML = ''; // Clear previous file list

        // Iterate through selected files
        for (var i = 0; i < fileList.length; i++) {

            var fileName = fileList[i].name;
                
            cvQueue.push(fileName);
            
            var li = document.createElement('li');
            li.innerHTML = '<img src="static/assets/cv.png" height="30px"> <div class="divider"></div> <p id="fileName">' + fileName + '</p>'
             
            cvList.appendChild(li);
        }
    });



    // void Main ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
    //Start Presed or Begin Play
    document.getElementById('submit').addEventListener('click', function (event) 
    {

        event.preventDefault(); // Prevents the default form submission behavior

        var showerror = document.getElementById('error'); 
        var parsedCvList = document.getElementById('parsedCvList'); 

        if(! document.getElementById("submit").disabled)
        {
            updateProgressBar(0);
            parsedCvList.innerHTML = '<li>CV Queue: Empty</li>'; 
            showerror.innerHTML = "";
            parsedCvQueue =[];


            // To check all the validity if the inputs types
            if(checkForm())
            {
            
                callApi(0); 
 
            }
        }

        
    });
}




// Utils functions

function checkForm()
{
    // Check if all fields are filled
    var jdFile = document.getElementById('jdFile').files.length > 0;
    var cvFile = document.getElementById('cvFiles').files.length > 0;
    var email = document.getElementById('email').value.trim() !== ''; 
    var showerror = document.getElementById('error');
    var thrushHold = document.getElementById('threshold').value;
    
    
    if((jdFile && cvFile && email &&(thrushHold>0 && thrushHold<100)))
    {
        // disabel Start
        document.getElementById("submit").disabled = true;
        showerror.style.color= '#888';
        showerror.innerText = 'in Progress...';
        
        return true
    }

    else
    {
        showerror.style.color= 'red';
        if(!jdFile)
            showerror.innerText = 'Jd not Submited!';
        else if(!cvFile)
            showerror.innerText = 'Cv not Submited!';
        else if(!email)
            showerror.innerText = 'Enter Email!'; 
        else if(!(thrushHold>0 && thrushHold<100))
            showerror.innerText = 'Set thrushHold between 1~99%'; 
         
        return false
    } 

}
 

function callApi(cvIndex) {
    if (cvIndex < cvQueue.length) 
    {
        
        var formData = new FormData();
    
        var jdFileInput = document.getElementById('jdFile').files[0].name;
        var cvFileInput = cvQueue[cvIndex];
        var parsedCvList = document.getElementById('parsedCvList');
        var email = document.getElementById('email').value;
        var threshold = document.getElementById('threshold').value;
        var state = document.getElementById('state');

    
        // Append the files to the FormData object
    
        formData.append('jdFile', jd_base_path + jdFileInput);
        formData.append('cvFile', cv_base_path + cvFileInput);
        formData.append('email', email);
        formData.append('threshold', threshold);
        updateProgressBar((cvIndex/(cvQueue.length))*100)  ;
        state.innerText = cvFileInput;
        $.ajax({
            url: base_url + "/post_example",  // Correct route
            method: "POST",
            processData: false,
            contentType: false,
            data: formData,
            success: function (data) {
            if (data) 
            {

                if(cvIndex == 0)
                {
                    parsedCvList.innerHTML = '';    
                }

                appendParsedCvList(data, cvFileInput,cvIndex);
            }

                
                // Increment and make the recursive call
                 callApi(cvIndex + 1);
            },
            error: function (xhr, status, error) {
            
                data = { cv_content: "no Data", match: "Cv not Parsed ", score: "Error" };
                if(cvIndex == 0)
                {
                    parsedCvList.innerHTML = '';    
                }
                appendParsedCvList(data, cvFileInput,cvIndex);
    
                // Increment and make the recursive call  
                callApi(cvIndex + 1); 
                
            },
        });
    } else 
    {
        var showerror = document.getElementById('error');
        
        // Enabel Start Button
        document.getElementById("submit").disabled = false;
        updateProgressBar(100)  
        showerror.innerHTML = "Done!";
        
        
      return;
    }
  }
  

function appendParsedCvList(data , fileName,index)
{
    
    var parsedCvList = document.getElementById('parsedCvList');


    if(parsedCvQueue.length == 0)
    {
        parsedCvList.innerHTML = ''; // Clear previous file list
    }
    parsedCvQueue.push(data)
    

    var li = document.createElement('li'); 
    li.innerHTML = '<div id="jsScore">' + data['score'] + '%</div> <div class="divider"></div> <p id="fileName">' + fileName + '</p>'
    li.id=index;
    
    li.addEventListener('click', function(event) 
    {
        // Get the index of the clicked <li>
        for (var j = 0; j < parsedCvList.children.length; j++) 
        {
            parsedCvList.children[j].style.border = 'none';
            
        }
        
        li.style.border = '1px solid #ccc';
        var name = this.children[2].innerText;
        var id = this.id;

        addDetail(parsedCvQueue[parseInt(id)],name)
        
    });
    parsedCvList.appendChild(li);

    

}

function updateProgressBar(percentage) {
    var loadBar = document.getElementById('load');
    var loadingBarState = document.getElementById('loadingBarState');

    loadBar.style.width = percentage + '%';
    loadingBarState.innerText = Math.round(percentage) + '%';
}


function addDetail(data , name)
{
    var textarea = document.getElementById('cv_content');
    var match =  document.getElementById('match');
    textarea.innerText = data['cv_content']

    match.innerHTML = "<p><b>Cv name: </b>"+name+"</p>"+"<p><b>Match quality: </b>"+data['match']+"</p> "+"<p><b>Score: </b>"+ data['score']+"%</p> ";
    
}
