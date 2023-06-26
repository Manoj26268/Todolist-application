const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db = 'mongodb+srv://manojanthati26:Manoj@cluster0.zxoafsd.mongodb.net/Todolistapplication?retryWrites=true&w=majority';

mongoose.connect(db,{
  useNewUrlParser:true,
  useUnifiedTopology:true
}).then(()=>{
  console.log("connection is succesful");
}).catch((err)=>console.log(err));

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
});

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name:"Welcome to your todolist"
});
const item2 = new Item({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name:"<-- Hit this to delete an item"
});
const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  (async ()=> {
    try {
      const foundItems = await Item.find({});
      // console.log("found all and pushed them in items array");
      // mongoose.connection.close();
      if(foundItems.length === 0){
          (async ()=> {
            try {
              const item = await Item.insertMany(defaultItems);
              console.log("inserted successfully");
              res.redirect("/");
              // mongoose.connection.close();
            } catch (err) {
              console.log(err);
            }
          })();
         
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      
      
    } catch (err) {
      console.log(err);
    }
   
  })();

 

});


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize( _.lowerCase(req.params.customListName));
  
  (async ()=> {
    try {
      const foundList = await List.findOne({name: customListName});
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
      // mongoose.connection.close();
    } catch (err) {
      console.log(err);
    }
  })();
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    (async ()=> {
      try {
        const item = await Item.findByIdAndRemove(checkedItemId);
        // console.log("deleted successfully");
        res.redirect("/");
        // mongoose.connection.close();
      } catch (err) {
        console.log(err);
      }
    })();
  }
  else {
    (async ()=> {
      try {
        const list = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
        // console.log("deleted successfully");
        res.redirect("/" + listName);
        // mongoose.connection.close();
      } catch (err) {
        console.log(err);
      }
    })();
   
  }
   
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    (async ()=> {
      try {
        const foundList = await  List.findOne({name: listName});
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
        // mongoose.connection.close();
      } catch (err) {
        console.log(err);
      }
    })();
  }


});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
