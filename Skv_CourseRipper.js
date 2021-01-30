var RipedData = new Object();
var categoryArray = new Array();
var linkArray = new Array();
var ManURL = "https://www.skolverket.se/undervisning/gymnasieskolan/laroplan-program-och-amnen-i-gymnasieskolan/hitta-program-amnen-och-kurser-i-gymnasieskolan?url=1530314731%2Fsyllabuscw%2Fjsp%2Fsearch.htm%3FalphaSearchString%3D%26searchType%3DFREETEXT%26searchRange%3DCOURSE%26subjectCategory%3DOTHER%26searchString%3D&sv.url=12.5dfee44715d35a5cdfa8e7a";

async function run()
{
    
    await selectURLs();

    RipedData.categories = categoryArray;

    download("dump.json",JSON.stringify(RipedData));
}

async function selectURLs()
{
    return new Promise(async resolve => {
        var children = document.querySelector("div.result_list").children;

        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            
            if (element.tagName == "TABLE")
            {
                await getData(element.children[1].children[0].children[0].children[0].href);
            }
        }
        resolve('resolved');
    })

}

function stringToHTML(str) {
	var dom = document.createElement('div');
    dom.innerHTML = str;
    //console.log(dom);
	return dom;
};


async function getData(url)
{
    return new Promise(resolve => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                ripData(stringToHTML(this.responseText));
                resolve('resolved');
            }
        };
        xhttp.open("POST", url, true);
        xhttp.send();
    })
}

async function ripData(doc)
{
    var course_wrapper = doc.querySelector("article > div > section");
    var courseCategory = new Object();
    var courseCategoryName = doc.querySelector("article > header").children[0].innerText;
    courseCategory.name = courseCategoryName.substring(courseCategoryName.indexOf('-')+2);
    var courseArray = new Array();
    console.log("Ripping category: "+courseCategory.name);

    for (let i = 0; i < course_wrapper.children.length; i++) 
    {
        const element = course_wrapper.children[i];
        if (element.tagName == "ARTICLE")
        {
            var course = new Object();
            var namePointString = element.children[0].children[0].innerText;
            var nameString = namePointString.substring(0,namePointString.indexOf(','));
            var pointsString = namePointString.substring(namePointString.indexOf(',')+2);
            pointsString = pointsString.substring(0, pointsString.length-7);
            var courseCodeString = element.children[1].children[0].innerText;

            course.name = nameString;
            course.points = pointsString;
            course.code = courseCodeString.substring(courseCodeString.indexOf(':')+2);
            courseArray.push(course);
        }
    }
    courseCategory.courses = courseArray;
    categoryArray.push(courseCategory);
    currentResponses++;
}

async function download(filename, text) 
{
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}