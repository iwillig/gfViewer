/*jslint browser: true, nomen: true, indent: 4, maxlen: 80 */
/*global jQuery, _, Backbone, window, OpenLayers, CodeMirror, document */

(function ($) {
    'use strict';

    var Map = Backbone.Model.extend({
        defaults: {
            title: 'This is a map title'
        }
    }),
        DataSet = Backbone.Model.extend({}),
        DataSetList = Backbone.Collection.extend({
            model: DataSet
        }),
        Style = Backbone.Model.extend({}),
        StyleList = Backbone.Collection.extend({
            model: Style,
        }),
        Styles = new StyleList(),
        Layer = Backbone.Model.extend({}),
        LayerList = Backbone.Collection.extend({
            model: Layer
        }),
        Layers = new LayerList(),
        LayerElement = Backbone.View.extend({
            tagName: 'li',
            template: _.template($('#layerTreeTemplate').html()),
            className: 'layer-tree',

            events: {
                'click .show-metadata': 'updateLayer',
                'click .toggle-view-p': 'toggleMapView'
            },

            initialize: function () {
                this.listenTo(this.model, 'change', this.render);
            },
            updateLayer: function () {
                console.log(this.model);
            },
            toggleMapView: function () {

            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        }),
        LayerTree = Backbone.View.extend({
            el: '#layer-tree',

            initialize: function () {
                this.ul = this.$el.find('ul#local-layers');
                this.listenTo(Layers, 'add', this.render);
            },

            render: function () {
                var self = this;
                self.ul.empty();

                Layers.each(function (layer) {
                    var view = new LayerElement({model: layer});
                    self.ul.append(view.render().$el);
                });
                return this;
            }
        }),
        StyleSelector = Backbone.View.extend({
            el: '#style-selector',
            template: _.template($('#styleSelectorTemplate').html()),
            events: {
                'change': 'select'
            },
            initialize: function () {
                this.collection.bind('add', this.render, this);
            },
            getActiveStyle: function () {
                var name = this.$el.find('option:selected').data('name');
                return _.first(this.collection.where({name: name}));
            },
            select: function (evt) {
                var style = this.getActiveStyle();
                if (style) {
                    this.options.editor.setValue(style.get('body'));
                }
            },
            render: function () {
                this.$el.html(this.template({
                    styles: this.collection.toJSON()
                }));
                return this;
            }
        }),
        AddLayerView = Backbone.View.extend({});

/* 

*/

    $(function () {
        var olMap = $("#ol-map").height(window.innerHeight),
            styleSelector,
            editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                lineNumbers: true,
                matchBrackets: true,
                theme: "twilight",
                mode: "text/x-yaml",
                onKeyEvent: function (editor, evt) {
                    var style;
                    if (evt.type === 'keypress') {
                        style = styleSelector.getActiveStyle();
                        if (style) {
                            console.log(style.get('name'));
                            style.set('body', editor.getValue());
                        }
                    }
                }

            }),

            layerTree = new LayerTree({
                collection: Layers
            });

        styleSelector = new StyleSelector({
            collection: Styles,
            editor: editor
        });

        $('#newStyle').click(function (evnt) {
            Styles.add({name: 'Random style' + Date.now(),
                       body: 'more content'});
        });

        Styles.add([
            {
                id: 1,
                name: 'style one',
                body: ''
            },
            {
                id: 2,
                name: 'style two',
                body: 'This is some content'
            }
        ]);

        Layers.add([
            {
                id: 1,
                name: 'Planet Line OSM'
            },
            {
                id: 2,
                name: 'A great layer'
            }
        ]);

    });

}(jQuery));
