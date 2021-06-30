# Investment Planner

## Introduction

The goal of this personal project is to learn about long-term investment on the stock market.

I have based my approach on several learning materials, such as
[IFA.com](https://www.ifa.com/charts/), [Investopedia](https://www.investopedia.com/) and
[The Money Guy Show](https://www.youtube.com/user/MoneyGuyShow).

Thanks to GitHub Pages, this application
is [directly available via this link](https://marcplouhinec.github.io/investment-planner/index.html).

## Architecture

The main objective was to build something quickly, that is why there is no compilation or packaging step:
just open the [index.html](./index.html) file with a web browser and voilà!

The [test.html](./test.html) file contains few unit tests that allow me to quickly validate core functions.

## Usage

The application consist in analyzing and simulating a portfolio configured via a
[JSON5](https://json5.org/) DSL. The code on the left-side of the page is then processed to generate charts and tables
on the right-side.
