export const AddBlankLine = (size, num)=> {
  let arr = [];
  for (let i = 0; i < num; ++i){
    let title_start_line = {
      "type":"text",
      //需要打印的文本
      "str":"       ",
      //排布方向（0：居左，1：居中，2：居右）
      "align":0,
      //字体大小（0-7自小到大递增）
      "size":size,
      //是否加粗（0：不加粗，1：加粗）
      "bold":0
    };
    arr.push(title_start_line);
  }
  return arr;
};

export const AddTextContent = (text, align, size, bold)=> {
  let obj = {
    type:'text',
    str:text,
    align:align,
    size:size,
    bold:bold
  };
  return obj;
};

export const AddImageContent = (image, align)=> {
  let obj = {
    type:'image',
    image_info:image,
    align:align
  };
  return obj;
};

