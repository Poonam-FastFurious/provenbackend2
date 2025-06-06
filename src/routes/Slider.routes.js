import { Router } from "express";
import { upload } from "../middlewares/FileUpload.middlwares.js";
import { addSlider, deleteSlider, getAllSliders, getSliderById, updateSlider } from "../controllers/Slider.controler.js";


const router = Router();

router.route("/add").post(
      upload.fields([
            {
                  name: "sliderImage",
                  maxCount: 1,
            },
      ]),
      addSlider
);
router.route("/edit").patch(
      upload.fields([
            {
                  name: "sliderImage",
                  maxCount: 1,
            },
      ]),
      updateSlider
);
router.route("/allslider").get(getAllSliders);
router.route("/delete").delete(deleteSlider);
router.route("/:id").get(getSliderById);

export default router;
