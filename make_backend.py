import os

# Write courseCategory.controller.js
controller_content = """const express = require("express");
const { Controller } = require("../core");
const { courseCategoryService } = require("../services");
const { AdminMiddleware } = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

class CourseCategoryController extends Controller {
    _rootPath = "/courseCategory";
    _router = express.Router();

    constructor() {
        super();
        this.initController();
    }

    getAll = asyncHandler(async (req, res) => {
        const categories = await courseCategoryService.getAll();
        res.json({ categories });
    });

    createCourseCategory = asyncHandler(async (req, res) => {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        const category = await courseCategoryService.createCourseCategory({ name, description });
        res.status(201).json({
            message: "Course category created successfully",
            category,
        });
    });

    updateCourseCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        const category = await courseCategoryService.updateCourseCategory(id, { name, description });
        if (!category) {
            return res.status(404).json({ message: "Course category not found" });
        }

        res.json({
            message: "Course category updated successfully",
            category,
        });
    });

    deleteCourseCategory = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const category = await courseCategoryService.deleteCourseCategory(id);

        if (!category) {
            return res.status(404).json({ message: "Course category not found" });
        }

        res.json({
            message: "Course category deleted successfully",
            category,
        });
    });

    initController = () => {
        this._router.get(this._rootPath, this.getAll);
        this._router.post(this._rootPath + "/create", AdminMiddleware, this.createCourseCategory);
        this._router.patch(this._rootPath + "/update/:id", AdminMiddleware, this.updateCourseCategory);
        this._router.delete(this._rootPath + "/delete/:id", AdminMiddleware, this.deleteCourseCategory);
    };
}

module.exports = CourseCategoryController;
"""

with open('../open-trash-tech-be/controllers/courseCategory.controller.js', 'w') as f:
    f.write(controller_content)


# Update controllers/index.js
with open('../open-trash-tech-be/controllers/index.js', 'r') as f:
    controllers_index = f.read()
if "CourseCategoryController" not in controllers_index:
    controllers_index += '\\nmodule.exports.CourseCategoryController = require("./courseCategory.controller");'
    with open('../open-trash-tech-be/controllers/index.js', 'w') as f:
        f.write(controllers_index)

# Update models/index.js
with open('../open-trash-tech-be/models/index.js', 'r') as f:
    models_index = f.read()
if "CourseCategory" not in models_index:
    models_index += '\\nmodule.exports.CourseCategory = require("./courseCategory.schema");'
    with open('../open-trash-tech-be/models/index.js', 'w') as f:
        f.write(models_index)

# Update services/index.js
with open('../open-trash-tech-be/services/index.js', 'r') as f:
    services_index = f.read()
if "courseCategoryService" not in services_index:
    services_index += '\\nmodule.exports.courseCategoryService = require("./courseCategory.services");'
    with open('../open-trash-tech-be/services/index.js', 'w') as f:
        f.write(services_index)

# Update course.schema.js reference
with open('../open-trash-tech-be/models/course.schema.js', 'r') as f:
    course_schema = f.read()
course_schema = course_schema.replace('ref: "category"', 'ref: "CourseCategory"')
with open('../open-trash-tech-be/models/course.schema.js', 'w') as f:
    f.write(course_schema)

# Update index.js (main AppServer)
with open('../open-trash-tech-be/index.js', 'r') as f:
    main_index = f.read()
if "CourseCategoryController" not in main_index:
    main_index = main_index.replace('const {', 'const { CourseCategoryController,')
    main_index = main_index.replace('new CourseController(),', 'new CourseController(),\\n  new CourseCategoryController(),')
    with open('../open-trash-tech-be/index.js', 'w') as f:
        f.write(main_index)

print("Backend API fully setup!")
