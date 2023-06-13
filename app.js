const express = require("express");
const bodyParser = require("body-parser");
const day = require(__dirname+"/date.js");
const mongoose = require("mongoose");

const app = express();
// To initialize ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Database Connection:
mongoose.connect("mongodb+srv://ayush002jha:fldQu5TkJQXNaX1L@cluster0.qaiw30b.mongodb.net/todoDB?retryWrites=true&w=majority");
// Database Schema: 
const itemSchema = mongoose.Schema({ 
    name: { 
        type: String,
        required: true
    }
})
const listSchema = mongoose.Schema({
    name:String,
    items: [itemSchema]

})
// Database Collection Model: 
const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);

// This Function is used to return the Default List Items
function defaultItems(type){
    // Create default object:
    let items = [];
    if(type==="category"){
        const item1 = new Item({
            name: "Work"
        });
        const item2 = new Item({
            name: "Chores"
        }); 
        const item3 = new Item({
            name: "Next Week"
        });
        items = [item1,item2,item3] ;
    }else{
        const item1 = new Item({
            name: "Welcome to To Do List!"
        });
        const item2 = new Item({
            name: `Hit the + button to add an item!`
        }); 
        const item3 = new Item({
            name: `<-- Hit this to remove an item!>`
        });
        items = [item1,item2,item3] ; 
    }
    return items;
};
 
// This Get request renders the Home Page!
app.get("/",async (req,res)=>{  
    const count = await Item.estimatedDocumentCount();
    if(count===0){
        Item.insertMany(defaultItems("category"));
        res.redirect("/"); 
    } 
    const dataItems =  await Item.find({});
    console.log(dataItems) 
    res.render('home',{TITLE: day.Day,ITEMS: dataItems});   
});

// This Get request renders the pages of User Created ToDoList 
app.get("/:customListName",async (req,res)=>{ 
    const customListName = req.params.customListName;
    const found = await List.findOne({ name: customListName }).exec();
    if (!found){
        const list = new List({
            name: customListName,
            items: defaultItems("list")
        })
        list.save(); 
        res.redirect("/"+customListName); 
    }else{
        res.render("list",{TITLE: found.name,ITEMS: found.items });
    }
});
// TO RESET THE APP
app.get("/rm/clear",async (req,res)=>{
    await Item.deleteMany({});
    await List.deleteMany({});
    res.redirect("/");
});

// This Post Request Lets the user create various ToDo
app.post("/",(req,res)=>{
    var newItem = req.body.userInput;
    const item = new Item({
        name: newItem
    });
    item.save();
    res.redirect("/");     
});

// This post request handles all the User Generated Todo Lists: Data Insertion
app.post("/:customListName",async (req,res)=>{
    const customListName = req.params.customListName;
    var newItem = req.body.userInput;
    const item = new Item({
        name: newItem
    });
    const found = await List.findOne({ name: customListName });
    found.items.push(item); 
    found.save();
    res.redirect("/"+customListName); 
});

//  This Route helps in deleting the items/data from ToDo Lists 
app.post("/rm/delete",async (req,res)=>{ 
    const id = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day.Day){
        await Item.deleteOne({_id:id});
        res.redirect("/");
    }else{
        await List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: id}}});
        res.redirect("/"+listName);
    }

});

// Server is running on Port
app.listen(process.env.PORT||3000,()=>{
    console.log("server is running on port 3000");
})
 