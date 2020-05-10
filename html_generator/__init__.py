import pandas as pd
from slugify import slugify
from tqdm import tqdm
from htmlmin import minify
import os
from html_generator.generate_plot import generate_plot
from html_generator.generate_table import generate_table
from html_generator.generate_index import generate_index
import numpy as np


def generate_html(df, plot_data, path):
    with open(os.path.join(path, "paths.txt"), "r") as f:
        save_path = f.read()

    plot_data = clean_array(plot_data)

    index_string = generate_index(df)

    # Load in the main template for all the sub pages
    files = []
    with open(os.path.join(path, "templates/header.html"), "r") as f:
        header = f.read()
    with open(os.path.join(path, "templates/main_template.html"), "r") as f:
        template_string = f.read()
    template_string = minify(template_string.replace("<!--LIST-->", index_string))
    template_string = template_string.replace("<!--HEADER-->", header)
    template_string = template_string.replace("<!--TITLE-->", "TurboTin")

    # Add the headers to each page template and copy it into the html_data folder
    custom_pages = ["faq", "email_updates"]
    for page in custom_pages:
        with open(os.path.join(path, "templates/" + page + ".html"), "r") as f:
            page_html = f.read().replace("<!--HEADER-->", header)
        page_html = page_html.replace("<!--TITLE-->", "TurboTin")
        with open(os.path.join(save_path, page + ".html"), "w") as f:
            f.write(page_html)
        files.append(page + ".html")

    item_card = '''
            <div class="item-card">
                <div class="item-body">
                    <div class="item-body-sub">
                        <a href="<!--LINK-->" class="item-name" target="_blank"><!--NAME--></a>
                        <div class="item-time"><!--TIME--></div>
                    </div>
                    <span></span>
                    <div class="item-price-store">
                        <div class="item-price"><!--PRICE--></div>
                        <div class="item-store"><!--STORE--></div>
                    </div>
                </div>
            </div>
    '''
    replace_list = [["<!--LINK-->", "link"],
                    ["<!--NAME-->", "item"],
                    ["<!--TIME-->", "time"],
                    ["<!--PRICE-->", "price"],
                    ["<!--STORE-->", "store"]]

    files.append("full_table.html")
    generate_table(df, path, save_path)

    # Convert prices to numbers and make errors very large so that they are listed last
    df["num-price"] = pd.to_numeric(df["price"].str[1:], errors="coerce").fillna(10 ** 9)

    # Convert time to out of stock and color red if out of stock
    df["time"] = np.where(df["stock"] != "Out of stock", df["time"], '''<div class="stock">Out of stock</div>''')

    # Replace all values in replace list with correct data for every row in dataframe
    post_string = item_card
    df["item-card"] = ""
    for pair in replace_list:
        value, key = pair
        pre_string, post_string = post_string.split(value)
        df["item-card"] = df["item-card"] + pre_string + df[key]
    df["item-card"] = df["item-card"] + post_string

    df = df[["item-card", "num-price", "brand", "blend"]]

    # Create the actual html page from the template
    for index, data in tqdm(df.groupby(['brand', 'blend']), desc="Generating html"):
        brand, blend = index
        data = data.sort_values("num-price")
        url = slugify(brand + " " + blend)
        string = template_string
        string = string.replace("<!--BLEND NAME-->", blend)
        string = string.replace("<!--TITLE-->", "TurboTin - " + blend)
        string = string.replace("<!--ITEM LIST-->", data["item-card"].str.cat(sep="\n"))
        string = string.replace("<!--PLOT-->", generate_plot(plot_data, brand, blend))
        with open(os.path.join(save_path, url + ".html"), "w", encoding="utf-8") as f:
            f.write(string)
        files.append(url + ".html")

    # Delete files that weren't updated (This is to prevent the directory from getting clogged with old files)
    for file in os.listdir(save_path):
        if file not in files:
            os.remove(os.path.join(save_path, file))


def clean_array(df):
    df["datetime"] = pd.to_datetime(df["date"], format=r"%Y, %m, %d")
    df["day"] = df["date"].str.extract(r"\d{4}, \d{2}, (\d{2})")
    df["month"] = df["date"].str.extract(r"\d{4}, (\d{2}), \d{2}")
    df["month"] = df["month"].astype("int").add(-1)
    df["year"] = df["date"].str.extract(r"(\d{4}), \d{2}, \d{2}")
    df["date"] = "new Date(" + df["year"] + ", " + df["month"].astype("str") + ", " + df["day"] + ")"
    df = df.drop(["year", "month", "day"], axis=1)
    df["stock-string"] = df["stock"]
    df["stock"] = df["stock"] != "Out of stock"
    df["charts-var"] = "{v:" + df["price"] + ", f: '$" + df["price"] + ", " + df["stock-string"] + "'}," + df[
        "stock"].astype(str).str.lower()
    df = df.drop(["price", "stock", "stock-string"], axis=1)
    return df
