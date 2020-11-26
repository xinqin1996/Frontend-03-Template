// 爬取网页上的所有图片
let imgTypes = ["img", "image"]
let imgArray = [];
imgTypes.forEach(type => {
  imgArray = imgArray.concat(...document.querySelectorAll(type))
})

let div = document.createElement("div");
// div.style = ""
imgArray.forEach((item) => { // 直接将图片添加到div元素中
  let box = document.createElement("div");
  box.style = "width: 20%; border: 1px solid #cccccc; box-sizing: border-box; display: inline-block; vertical-align: middle; position: relative; padding: 10px"
  item.style += ";width: 100%;"
  box.appendChild(item)
  div.appendChild(box)
})
document.body.innerHTML = '';
document.body.appendChild(div)