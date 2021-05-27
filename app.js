const express = require("express");
const fs = require("fs");
const path = require("path");
const methodOverride = require("method-override");
const app = express();
const port = 3000;
var csvjson = require('csvjson');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'pictures')));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const parseCsvWithHeader = (filepath, cb) => {
  const rowSeparator = "\n";
  const cellSeparator = ",";
  // example based on a CSV file
  fs.readFile(filepath, "utf8", (err, data) => {
    const rows = data.split(rowSeparator);
    // first row is an header I isolate it
    const [headerRow, ...contentRows] = rows;
    const header = headerRow.split(cellSeparator);

    const items = contentRows.map((row) => {
      const cells = row.split(cellSeparator);
      const item = {
        [header[0]]: cells[0],
        [header[1]]: cells[1],
        [header[2]]: cells[2],
        [header[3]]: cells[3],
        [header[4]]: cells[4],
        [header[5]]: cells[5],
        [header[6]]: cells[6],
      };
      return item;
    });
    return cb(null, items);
  });
};

const getStudentsFromCsvfile = (cb) => {
  parseCsvWithHeader("./students.csv", cb);
};

const fromCsvtoJson = (student) => {
  var Document = fs.readFileSync('./students.csv').toString().split('\n');
  var Columns = Document[0];
  Document.shift();
  Columns = Columns.split(',');
  var Json = []
  for (var i = 0; i < Document.length; i++) {
  var Data = {}
  var Element = Document[i].split(',')
  for (var j = 0; j < Element.length; j++) {
     Data[Columns[j]] = Element[j]
  }
  Json.push(Data)
  if (student.name === Data['name']) {
    Data['school'] = student.school;
    Data['birth'] = student.birth;
    Data['nationality'] = student.nationality;
    Data['mail'] = student.mail;
  }
}
  Data = JSON.stringify(Json)
  fs.writeFileSync('data.json', Data, function (err) {
    if (err) {
      res.redirect("/students");
    } else {
      res.redirect("/students");
    }
  })
}

const fromJsontoCsv = () => {
  const readFile = fs.readFile;
  const writeFile = fs.writeFile;
  readFile('./data.json', 'utf-8', (err, fileContent) => {
    if (err) {
        // Doing something to handle the error or just throw it
        console.log(err); 
        throw new Error(err);
    }
  
    // Convert json to csv function
    const csvData = csvjson.toCSV(fileContent, {
        headers: 'key'
    });
  
    // Write data into csv file named college_data.csv
    writeFile('./students.csv', csvData, (err) => {
        if(err) {
            // Do something to handle the error or just throw it
            console.log(err); 
            throw new Error(err);
        }
        console.log('Data stored into csv file successfully');
    });
});
};

const storeStudentInCsvFile = (student, cb) => {
  const csvLine = `\n${student.name},${student.school},${student.birthdate},${student.nationality},${student.mail}`;
  fs.writeFile("./students.csv", csvLine, { flag: "a" }, (err) => {
    cb(err, "ok");
  });
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/home.html"));
});

app.get("/students/data", (req, res) => {
  res.render("students-data");
});

app.get("/students", (req, res) => {
  getStudentsFromCsvfile((err, students) => {
    if (err) {
      console.error(err);
      res.send("ERROR");
    }
    res.render("students", {
      students,
    });
  });
});

app.get("/students/update", (req, res) => {
  const id = req.params.id;
  getStudentsFromCsvfile((err, students) => {
    res.render("update-student", { students, id: id })
  })
})

app.get("/students/create", (req, res) => {
  res.render("create-student");
});

app.get('/students/:id', (req, res) => {
  const id = req.params.id;
  getStudentsFromCsvfile((err, students) => {
    res.render("student_details", { students, id: id })
  })
})

app.get('/students/update/:id', (req, res) => {
  const id = req.params.id;
  getStudentsFromCsvfile((err, students) => {
    res.render("update-student", { students, id: id })
  })
})

app.post("/students/create", (req, res) => {
  console.log(req.body);
  const student = req.body;
  storeStudentInCsvFile(student, (err, storeResult) => {
    if (err) {
      res.redirect("/students/create?error=1");
    } else {
      res.redirect("/students/create?created=1");
    }
  });
});

app.post("/students/update/:id", (req, res) => {
  const student = req.body;
  fromCsvtoJson(student);
  fromJsontoCsv();
  res.sendFile(path.join(__dirname, "./views/home.html"));
  });

app.put("/students/:id", (req, res) => {
  const student = req.body;
  fromCsvtoJson(student);
  fromJsontoCsv();
  res.sendFile(path.join(__dirname, "./views/home.html"));
  });
  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
