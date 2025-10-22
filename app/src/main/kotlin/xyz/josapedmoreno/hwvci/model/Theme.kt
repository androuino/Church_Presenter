package xyz.josapedmoreno.hwvci.model

import com.intellisrc.db.annot.Column
import com.intellisrc.db.auto.Model

class Theme : Model() {
    @Column(primary = true, autoincrement = true)
    var id: Int = 0
    @Column
    var themeName: String = "default"
    @Column
    var font: String = "Ubuntu"
    @Column
    var fontSize: Int = 24
    @Column
    var fontColor: String = "#000000"
    @Column
    var bold: Boolean = false
    @Column
    var italic: Boolean = false
    @Column
    var strikeThrough: Boolean = false
    @Column
    var topLeftOffset: Int = 0
    @Column
    var topMiddleOffset: Int = 0
    @Column
    var topRightOffset: Int = 0
    @Column
    var leftUpperOffset: Int = 0
    @Column
    var rightUpperOffset: Int = 0
    @Column
    var leftMiddleOffset: Int = 0
    @Column
    var rightMiddleOffset: Int = 0
    @Column
    var leftLowerOffset: Int = 0
    @Column
    var rightLowerOffset: Int = 0
    @Column
    var leftBottomOffset: Int = 0
    @Column
    var middleBottomOffset: Int = 0
    @Column
    var rightBottomOffset: Int = 0
    @Column
    var textAlign: String = "center"
    @Column
    var justifyContent: String = "center"
    @Column
    var alignItems: String = "center"

    override fun toMap(): MutableMap<String, Any?> {
        return mutableMapOf(
            "id" to id,
            "theme_name" to themeName,
            "font" to font,
            "font_size" to fontSize,
            "font_color" to fontColor,
            "bold" to bold,
            "italic" to italic,
            "strike_through" to strikeThrough,
            "top_left_offset" to topLeftOffset,
            "top_middle_offset" to topMiddleOffset,
            "top_right_offset" to topRightOffset,
            "left_upper_offset" to leftUpperOffset,
            "right_upper_offset" to rightUpperOffset,
            "left_middle_offset" to leftMiddleOffset,
            "right_middle_offset" to rightMiddleOffset,
            "left_lower_offset" to leftLowerOffset,
            "right_lower_offset" to rightLowerOffset,
            "left_bottom_offset" to leftBottomOffset,
            "middle_bottom_offset" to middleBottomOffset,
            "right_bottom_offset" to rightBottomOffset,
            "text_align" to textAlign,
            "justify_content" to justifyContent,
            "align_items" to alignItems
        )
    }
}