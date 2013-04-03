---
title: Brix杂记
layout: post
---

## Brix入口

    引入brix.js,在bx-config中配置初始化信息。

## Brix的三大功能


* 组件管理器

    
    Brix:亲们,你写了组件了？你写了模块了？你想在页面使用?怎么用?
    JQuery:直接在页面引用script，$('selector').componentName(config)，帅吧？
    KISSY：楼上老土，模块化、按需加载才是这个时代的前端应该做的，use，var c = new componentName(config)
    SeaJS：JQuery兄，有我呢。
    JQuery:对对，加上SeaJS,我也能。
    Brix:我们能不能让开发者在写完组件后不关心什么时候去实例化（new）？
    JQuery:……。
    KISSY：……。
    SeaJS：……。
    Brix:我这有一剂良方（Pagelet），他能够实现区块的组件（模块）自动实例化并管理他们,^_^。

基于bx-name、bx-path、bx-config，完成组件的获取、实例化、统一管理。

* 模板局部刷新

    基于bx-tmpl、bx-datakey，完成子模板获取，通过监听数据，完成局部刷新。

* 组件生命周期约定

    * ARRTS
    * EVENTS
    * DOCEVENTS
    * METHODS
    * FIRES
    * RENDERDER
    

## tmpler

tmpler负责解析三类模板

* tmpl：ATTRS里的配置
    
    可以是node节点，可以是script节点id，可以是纯字符串

* subTmpl：bx-tmpl和bx-datakey表示的innerHTML
    
    通过setChunkData方法实现局部刷新

* storeTmpl：\{\{#bx-tmpl-id\}\}……\{\{/bx-tmpl\}\}中间的内容，用来后期组件或模块使用。

    通过getStoreTmpl(id)获取存储的模板


## mustache和mu成为历史

Brix已经完全移除对模板引擎的依赖，现在对模板引擎透明，供用户选择。