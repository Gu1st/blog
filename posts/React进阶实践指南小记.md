---
title: React进阶实践指南小记
date: 2024-11-18
category: React
top: false
tags:
  - React
description: '好记性不如烂笔头'
---

# React进阶实践指南小记
> 可以不用，不能不会；取长补短，互相学习

## 基础篇
------


### 组件本质

组件本质就是渲染视图的UI + 更新视图的方法、类组成



### 函数组件与类组件的本质区别

对于类组件，只需要实例化一次，因为实例中保存了组件的状态，每次更新只需要调用Render方法和生命周期就行。
函数组件每次更新都是一次新的函数执行，一次函数组件的更新，函数内的变量会重新声明。

> 所以为了让函数组件内部保存状态，或者执行一些副作用，所以Hooks就出现了，帮助React记录组件的状态，处理副作用



### Props和Callback
```jsx
/* 子组件 */
function Son(props){
    const {  fatherSay , sayFather  } = props
    return <div className='son' >
         我是子组件
        <div> 父组件对我说：{ fatherSay } </div>
        <input placeholder="我对父组件说" onChange={ (e)=>sayFather(e.target.value) }   />
    </div>
}
/* 父组件 */
function Father(){
    const [ childSay , setChildSay ] = useState('')
    const [ fatherSay , setFatherSay ] = useState('')
    return <div className="box father" >
        我是父组件
       <div> 子组件对我说：{ childSay } </div>
       <input placeholder="我对子组件说" onChange={ (e)=>setFatherSay(e.target.value) }   />
       <Son fatherSay={fatherSay}  sayFather={ setChildSay }  />
    </div>
}
```



### setState和useState
#### 类组件限制state视图更新
1. PureComponent仅会对props和state作浅比较,没变化则不会更新
2. shouldComponentUpdate可以手动通过返回布尔值决定更新



#### setState是同步还是异步？
1. React有自己的事件系统调度，一般情况下React的批量更新会在状态变化时开启，并在事件完成后关闭。
在批量更新中，会通过标识符开启批量更新的模式，接着将多个setState操作合并，也就是多次setState同一个状态的结果最终只会生效最后一次操作，更新完成后再关闭标识符开关，再进行Render并执行Callback
> 举个例子，将state.number + 1 ,执行三次， 最终在批量更新模式下，结果仍然为 1
```jsx
this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
console.log(this.state.number)
this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
console.log(this.state.number)
this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
console.log(this.state.number)
```
而此时如果将多个setState操作放入到SetTimeout中， 此时虽然批量更新的标识符值改变了， 但因为遇到SetTimeout并没有立即执行，等到实际执行时，因为批量更新标识符已经关闭，所以将不再走批量更新的逻辑。
在非批量更新逻辑时，setState会按照调用顺序，依次完成状态更新=>Render渲染=>回调执行
> 此时 将state.number + 1 ,执行三次， 最终在非批量更新模式下，结果为3  , 注意! 在18版本后即使使用定时器也已经统一变为批量更新了
```jsx
setTimeout(()=>{
  this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
  console.log(this.state.number)
  this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
  console.log(this.state.number)
  this.setState({ number:this.state.number + 1 },()=>{   console.log( 'callback1', this.state.number)  })
  console.log(this.state.number)
})
```
2. 对于Ajax数据交互后多次State更新操作，请通过React-Dom提供的unstable_batchedUpdates，将本次操作变为批量更新
3. React-Dom提供了flushSync用于提升事件的优先级，并且如果遇到flushSync时，会把函数调用前的同步更新语句合并变为一次批量更新，且会优先进行执行更新



#### useState
本质上函数组件的状态更新也是和类组件一样具备批量更新和非批量更新的情况，但因为函数组件每次更新都是一次函数新的执行，不同于类组件提供的Callback和生命周期，函数式要依靠useEffect副作用依赖的形式去拿到最新的值
> 需要注意，如果你不需要依赖旧数据的情况下那么可以直接传新的值， 而如果通过回调函数更新状态时，你可以访问到当前的状态值（prevState），并基于它来计算新的状态值


> React鼓励使用函数式更新，比如在批量更新下直接传新值在多次更新下可能会丢失状态，而使用回调函数你可以确保你拿到最新的状态值来计算
```js
setData(newValue)

setState((prevState) => {
  // ...基于prevState做一些计算
  return newValue;
});
```



### Props Children
Children模式在React中非常有用且常见，尤其是一些开源组件库都有使用
```jsx
<Container>
    <Children>
</Container>
```
通过`pros.children`可以访问Children组件, 其为一个React.Element对象.
1. 可以根据Children决定渲染
2. 可以混入Props或者修改Children自身

```jsx
const Container = (props: { children: React.FC }) => {
  const ContainerProps = {
    name: 'alien',
  }
  return props.children(ContainerProps)
}

const Children = (props: { name?: string }) => {
  return <div>
    {props.name}
  </div>
}

function App() {
  return (
    <div>
      <Container>
        {(ContainerProps) => <Children  {...ContainerProps} />}
      </Container>
    </div>
  )
}

export default App
```
此时children属性访问到的则是一个函数，我们可以通过函数调用形式再对props进行包装



### 实现简易Form/Form.Item函数组件
1. Form组件可以被Ref获取，同时提供SubmitForm获取表单内容提交，ResetForm重置表单
2. Form组件过滤所有非Form.Item组件
3. Form.Item使用name作为提交的key，同时自动收集Input组件的值

#### Form组件
```tsx
import  { forwardRef, PropsWithChildren, useImperativeHandle, useState,Children,cloneElement } from 'react'

// 要暴露的实例属性
interface FormRef{
    resetForm:()=>void;
    submitForm:(cb:(data:Record<string,any>)=>void)=>void
}

// 将函数组件包裹在forwardRef中 增加ref支持，然后结合useImperativeHandle钩子暴露
const Form = forwardRef<FormRef,PropsWithChildren>((props,ref) => {
    const [formData,setFormData] = useState<Record<string,any>>({})

    useImperativeHandle(ref,()=>({
        resetForm,
        submitForm
    }))

    // 清空表单
    const resetForm = () => {
        const newData:Record<string,any> = {}
        Object.keys(formData).forEach(item=>newData[item] = '')
        setFormData({
            ...newData
        })
    }
    // 提交表单
    const submitForm = (cb:(data:Record<string,any>)=>void)=>{
        cb({...formData})
    }

    // 更新表单值
    const setValue = (name:string,value:any) => {
        console.log(name,value)
        setFormData({
            ...formData,
            [name]:value
        })
    }

    const renderChildrens = Children.map(props.children,child=>{
        const childElement= child as any

        if(childElement && childElement.type.displayName == 'formItem'){
            return cloneElement(childElement,{
                value:formData[childElement.props.name],
                name:childElement.props.name,
                handleChange:setValue
            },childElement.props.children)
        }
        return null
    })

    return renderChildrens!.filter(item=>Boolean(item))

})

Form.displayName = 'form'

export default Form
```

#### FormItem组件
```tsx
import{ isValidElement,cloneElement, PropsWithChildren } from 'react'

export interface ItemProps{
    name:string;
    label:string;
    value:any;
    handleChange:(name:string,value:any)=>void;
}

const FormItem:React.FC<PropsWithChildren<ItemProps>> = (props) => {
    const {name,label,value,handleChange,children} = props

    const onChange = (value:any) => {
        handleChange(name, value)
    }

    return (<>
        <span>{label}:</span>
        {
            isValidElement(children) && (children.type as any).displayName == 'input' 
            ? cloneElement(children as React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>,{
                onChange,
                value
            })
            :null
        }
    </>)
}

FormItem.displayName = 'formItem'

export default FormItem

```

#### Input组件
```tsx
// 定义 props 的类型
interface InputProps {
    onChange?: (value: string) => void; // onChange 可能是可选的，所以使用 ?
    value: string; // 假设 value 是字符串类型
  }
/* Input 组件, 负责回传value值 */
const Input:React.FC<InputProps> = ({ onChange , value })=>{
    if(!value) value = '' // 初始化值  undefined会报错
    return  (
        <input className="input"  onChange={ (e)=>( onChange && onChange(e.target.value) ) } value={value}  />
    )
}
/* 给Component 增加标签 */
Input.displayName = 'input'

export default Input

```

#### 使用
```tsx
import {useRef} from "react"
import Form, { FormRef } from "./components/Form"
import FormItem from "./components/FormItem"
import Input from "./components/Input"

export default  () => {
  const formRef = useRef<FormRef>(null)
  const submit =()=>{
      formRef.current?.submitForm((formValue:any)=>{
          console.log(formValue)
      })
  }
  const reset = ()=>{
      formRef.current?.resetForm()
  }
  return <div className='box' >
      <Form ref={ formRef } >
          <FormItem name="name" label="我是"  >
              <Input/>
          </FormItem>
          <FormItem name="mes" label="我想对大家说"  >
              <Input/>
          </FormItem>
          <input  placeholder="不需要的input" />
          <Input/>
      </Form>
      <div className="btns" >
          <button className="searchbtn"  onClick={ submit } >提交</button>
          <button className="concellbtn" onClick={ reset } >重置</button>
      </div>
  </div>
}
```



### 生命周期
#### 类生命周期
##### constructor
1. 初始化state，做各种参数处理
2. 对事件做处理，比如节流防抖
```js
constructor(props){
    super(props)        // 执行 super ，别忘了传递props,才能在接下来的上下文中，获取到props。
    this.state={       //① 可以用来初始化state，比如可以用来获取路由中的
        name:'alien'
    }
    this.handleClick = this.handleClick.bind(this) /* ② 绑定 this */
    this.handleInputChange = debounce(this.handleInputChange , 500) /* ③ 绑定防抖函数，防抖 500 毫秒 */
    const _render = this.render
    this.render = function(){
        return _render.bind(this)  /* ④ 劫持修改类组件上的一些生命周期 */
    }
}
```
##### getDerivedStateFromProps
1. 代替componentWillMount和componentWillReceiveProps
2. 组件初始化或者更新时，将props映射到state中，返回值会与state合并
```js
static getDerivedStateFromProps(newProps,preState){
    const { type } = newProps
    switch(type){
        case 'fruit' : 
        return { list:['苹果','香蕉','葡萄' ] } /* ① 接受 props 变化 ， 返回值将作为新的 state ，用于 渲染 或 传递给s houldComponentUpdate */
        case 'vegetables':
        return { list:['菠菜','西红柿','土豆']}
    }
}
render(){
    return <div>{ this.state.list.map((item)=><li key={item} >{ item  }</li>) }</div>
}
```

##### componetWillMount/componentWillReceiveProps/componentWillUpdate
未来这三个生命周期会被彻底废弃，不做展开

##### render
render时会将所有jsx编译为对应React.Element元素，一次render就是一次创建React.Element的过程
我们可以在这个周期做一些创建元素、克隆元素、遍历元素的操作

##### getSnapshotBeforeUpdate
> getSnapshotBeforeUpdate(prevProps,preState){}
1. 需要和componentDidUpdate一起使用，它会拿到DOM修改前的状态，并将返回值作为componentDidUpdate的第三个参数使用
```js
getSnapshotBeforeUpdate(prevProps,preState){
    const style = getComputedStyle(this.node) 
    return { /* 传递更新前的元素位置 */
        cx:style.cx,
        cy:style.cy
    }
}
componentDidUpdate(prevProps, prevState, snapshot){
    /* 获取元素绘制之前的位置 */
    console.log(snapshot)
}
```

##### componentDidUpdate
```js
componentDidUpdate(prevProps, prevState, snapshot){
    const style = getComputedStyle(this.node)
    const newPosition = { /* 获取元素最新位置信息 */
        cx:style.cx,
        cy:style.cy
    }
}
```
> 该生命周期会在组件更新时执行,需要注意componentDidUpdate执行时，DOM已经更新

##### componentDidMount
```js
async componentDidMount(){
    this.node.addEventListener('click',()=>{
        /* 事件监听 */
    }) 
    const data = await this.getData() /* 数据请求 */
}
```
> 仅在组件初始化时执行，适合做一些 视图渲染，服务器数据获取、事件监听的操作

##### shouldComponentUpdate
一般用于性能优化，返回布尔值决定组件是否渲染
```js
shouldComponentUpdate(newProps,newState){
    if(newProps.a !== this.props.a ){ /* props中a属性发生变化 渲染组件 */
        return true
    }else if(newState.b !== this.props.b ){ /* state 中b属性发生变化 渲染组件 */
        return true
    }else{ /* 否则组件不渲染 */
        return false
    }
}
```
##### componentWillUnmount
组件卸载，一般用于清除定时器、解除监听，做收尾工作




#### 函数组件生命周期
##### useEffect/useLayoutEffect
> 大部分类组件的生命周期都可以交给这两个Hooks解决了，其监听依赖项的特性，我们可以轻松实现类生命周期
1. 两者用法一致
2. 前者会根据依赖项是否改变会触发回调，函数的Effect是一个异步任务，它在DOM更新、DOM视图渲染后才执行，所以不会阻塞浏览器绘制视图
3. 后者是在DOM更新后，DOM视图绘制之前，函数的Effect则是一个同步任务会阻塞浏览器绘制视图，所以通常需要修改DOM、布局才会使用它
```jsx
// 组件挂载
React.useEffect(()=>{
    /* 请求数据 ， 事件监听 ， 操纵dom */
},[])  /* 切记 dep = [] */

// 组件卸载
React.useEffect(()=>{
        /* 请求数据 ， 事件监听 ， 操纵dom ， 增加定时器，延时器 */
        return function componentWillUnmount(){
            /* 解除事件监听器 ，清除定时器，延时器 */
        }
},[])/* 切记 dep = [] */

// Props变化
React.useEffect(()=>{
    console.log('props变化：componentWillReceiveProps')
},[ props ])

// 组件更新，不定义依赖项，一次更新就代表一次函数执行
React.useEffect(()=>{
    console.log('组件更新完成：componentDidUpdate ')     
}) /* 没有 dep 依赖项 */
```

##### useInsertionEffect(V18 Hooks)
这个Hooks会在DOM更新之前就执行，比useLayoutEffect更早。其主要作用是解决CSS-IN-JS的渲染注入样式性能问题，其他场景用不到
> Styled-Components是通过动态生成一个哈希值来保证全局唯一并写入到样式中。如果我们需要再次注入样式，并把其逻辑写到useLayoutEffect中,由于useLayoutEffect发生在DOM更新完成后，如果再次重新动态生成style内容，就会导致回流和重绘的发生
```jsx
export default function Index(){

  React.useInsertionEffect(()=>{
     /* 动态创建 style 标签插入到 head 中 */
     const style = document.createElement('style')
     style.innerHTML = `
       .css-in-js{
         color: red;
         font-size: 20px;
       }
     `
     document.head.appendChild(style)
  },[])

  return <div className="css-in-js" > hello , useInsertionEffect </div>
}
```


### 实现ScrollView组件
> 基于对生命周期的理解，实现一个类似Webview中的长列表函数组件(触底加载)


#### 组件实现
```tsx
import { createElement,useLayoutEffect,useRef } from "react"
import { ListItemType, ListType } from "../App"

interface PropsType{
    data:ListType
    component:React.JSXElementConstructor<ListItemType>
    scrollTolower:()=>void
    scroll:(e:Event)=>void
}

function ScrollView(props:PropsType){

    const ListRef = useRef<HTMLDivElement>(null)

    // 页面加载完成后监听滚动
    useLayoutEffect(()=>{
        const ScrolltoLowerFn = (e:Event) => {
            const scrollTop = (e.currentTarget as HTMLDivElement).scrollTop // 已滚动高度
            const offsetHeight = (e.currentTarget as HTMLDivElement).offsetHeight // 容器高度
            const scrollHeight = (e.currentTarget as HTMLDivElement).scrollHeight // 滚动高度

            if((scrollTop + offsetHeight) >= scrollHeight){
                // 触底加载
                props.scrollTolower()
            }

            // 滚动事件
            props.scroll && props.scroll(e)
        }

        ListRef.current!.addEventListener('scroll',ScrolltoLowerFn)

        // 卸载注销事件
        return ()=> {
            console.log('监听滚动注销')
            ListRef.current!.removeEventListener('scroll',ScrolltoLowerFn)
        }
    },[])


    // 根据数据循环渲染
    return <div className="list_box" ref={ListRef}>
        {
            props.data.slice().map((item,index)=> createElement(props.component,{...item,key:index}))
        }
    </div>
}
export default ScrollView
```

#### 使用
```tsx
import { useState,useEffect } from "react"
import ScrollView from "./components/ScrollView";

export type ListType = Array<ListItemType>

export interface ListItemType{
    src:string;
    name:string;
    price:number;
}

export default function App() { 
    const [ data , setData ] = useState<ListType>([]) /* 记录列表数据 */

    /* 请求数据 */
    const getData = async ()=>{
        const res = await fetchData()

        setData((data)=>data.concat(res))
    }

    /* 滚动到底部触发 */
    const handerScrolltolower = () => {
        console.log('scroll已经到底部')
        getData()
    }

    // 滚动事件
    const handleScroll = (e:Event) => {
        console.log('触发滚动事件',e)
    }

    /* 初始化请求数据 */
    useEffect(()=>{
        getData()
    },[])
    return <ScrollView 
            data={ data }       /*  */
            component={ Item }  /* Item 渲染的单元组件 */
            scrollTolower={ handerScrolltolower }  // 触底触发
            scroll={ handleScroll }
        />
}
async function fetchData(){
    return Promise.resolve([
            {
                src:'https://img0.baidu.com/it/u=3102019309,2551389595&fm=253',
                name:'Mes是一个非常非常牛逼的东西，反正我很难解释的清楚，你只需要知道它非常的牛逼就可以了3Q!',
                price:188.80
            },
            {
                src:'https://img0.baidu.com/it/u=3102019309,2551389595&fm=253',
                name:'Mes是一个非常非常牛逼的东西，反正我很难解释的清楚，你只需要知道它非常的牛逼就可以了3Q!',
                price:188.80
            },
            {
                src:'https://img0.baidu.com/it/u=3102019309,2551389595&fm=253',
                name:'Mes是一个非常非常牛逼的东西，反正我很难解释的清楚，你只需要知道它非常的牛逼就可以了3Q!',
                price:188.80
            },
            {
                src:'https://img0.baidu.com/it/u=3102019309,2551389595&fm=253',
                name:'Mes是一个非常非常牛逼的东西，反正我很难解释的清楚，你只需要知道它非常的牛逼就可以了3Q!',
                price:188.80
            },
            {
                src:'https://img0.baidu.com/it/u=3102019309,2551389595&fm=253',
                name:'Mes是一个非常非常牛逼的东西，反正我很难解释的清楚，你只需要知道它非常的牛逼就可以了3Q!',
                price:188.80
            },
            {
                src:'https://img0.baidu.com/it/u=3102019309,2551389595&fm=253',
                name:'Mes是一个非常非常牛逼的东西，反正我很难解释的清楚，你只需要知道它非常的牛逼就可以了3Q!',
                price:188.80
            },
            {
                src:'https://img0.baidu.com/it/u=3102019309,2551389595&fm=253',
                name:'Mes是一个非常非常牛逼的东西，反正我很难解释的清楚，你只需要知道它非常的牛逼就可以了3Q!',
                price:188.80
            }
        ])
}

/* item 单元项的渲染list */
const Item:React.FC<ListItemType> = (props) => {
    return  <div className="goods_item" >
        <img src={props.src} className="item_image" />
        <div className="item_content" >
            <div className="goods_name" >
                {props.name}
            </div>
            <div className="hold_price" />
            <div className="new_price" >
                <div className="new_price" >
                    <div className="one view">
                        ¥ {props.price}
                    </div>
                </div>
            </div>
            <img className='go_share  go_text' />
        </div>
    </div>
}
```

### Ref
> 对于Ref对象的获取，类组件会把Ref对象挂载到实例上，方便进行操作

> 由于函数组件每次都会重复执行的特性，所以useRef产生的Ref对象实际是存在函数组件对应的fiber对象上，只要组件不销毁就一直可以使用

> Ref每次会在组件的更新前，将Ref的执行置空或null，更新后再获取DOM元素赋值到Ref的指向

#### Ref的组件通信
1. 类组件可以通过类似Vue2的方式，通过Ref的形式直接调用类组件自身的方法
2. 函数组件没有实例，需要通过forwardRef的包裹来完成Ref转发，再通过Hooks的useImperativeHandle将内部方法暴露给转发的Ref上

useImperativeHandle 具有三个参数：
1. ref, 从forWardRef传递来的ref，会将暴露的方法挂载到这个ref上
2. Handle，回调函数，其返回值是暴露给父组件的一个对象
3. Deps，依赖项，当然依赖项改变时产生新的Ref对象

```tsx
import { forwardRef, Ref, useImperativeHandle, useRef, useState } from "react"

export default function App() { 
    const sonInstance = useRef<{handleSetValue:(value:any)=>void}>(null)

    const WrapSon = forwardRef(Son)

    const handleClick = () => {
        sonInstance.current!.handleSetValue('test')
    }
    
    return <>
        <button onClick={handleClick}>改变Son的值</button>
        <WrapSon ref={sonInstance} ></WrapSon>
    </>
}

// 被包裹的函数组件 第二个参数可以提供ref
const Son = (_: any,ref: Ref<unknown> | undefined) => {
    const [value,setValue] = useState('')

    useImperativeHandle(ref,()=>{
        return {
            handleSetValue
        }
    })

    const handleSetValue = (value:any) => {
        setValue(value)
    }

    return <div>
        <input type="text" onChange={e=>handleSetValue(e.target.value)} value={value} />
    </div>
}
```

### CSS IN JS
todo: 笔记待续




## 优化篇
------

## 原理篇
------

## 特性篇
------

## 架构篇
------

## 生态篇
------

## 实践篇
------